import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "../utils/api";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DateTimePicker } from "@mantine/dates";
import Notification from "~/components/Notification";
import { CalendarIcon, PlusIcon } from "@heroicons/react/20/solid";

const Checklist: NextPage = () => {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <main>
      <Header addCallback={toggleOpen} />
      <Form addCallback={toggleOpen} isOpen={open} />
      <div className="mx-auto max-w-7xl dark:bg-slate-800 sm:px-6 lg:px-8">
        <TaskList addCallback={() => setOpen(true)} />
      </div>
    </main>
  );
};

type HeaderProps = {
  addCallback: () => void;
};

const Header = ({ addCallback }: HeaderProps) => {
  const { data: session, status } = useSession();
  const secBtnClassNames =
    "light:ring-1 light:ring-inset light:ring-gray-300 light:hover:bg-gray-50 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm dark:bg-white/10 dark:text-white dark:hover:bg-white/20";

  return (
    <div className="p-8 dark:bg-slate-800 md:flex md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          Checklist
        </h2>
      </div>
      {status !== "loading" && (
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {session ? (
            <button
              onClick={() => {
                signOut({
                  callbackUrl: "/",
                }).catch(console.error);
              }}
              type="button"
              className={secBtnClassNames}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                signIn("discord").catch(console.error);
              }}
              type="button"
              className={secBtnClassNames}
            >
              Login with Discord
            </button>
          )}
          {session && (
            <button
              onClick={() => {
                addCallback();
              }}
              type="button"
              className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
            >
              Add
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const TaskList = ({ addCallback }: HeaderProps) => {
  const utils = api.useContext();
  const { data: taskEntries, isLoading } = api.task.getAll.useQuery();
  const updatePriority = api.task.updatePriority.useMutation({
    onMutate: async (updatedEntry) => {
      await utils.task.getAll.cancel();
      utils.task.getAll.setData(undefined, (prevEntries) => {
        return prevEntries!.map((entry) => {
          if (entry.id === updatedEntry.id) {
            return { ...entry, priority: updatedEntry.priority };
          }
          return entry;
        });
      });
    },
    onSettled: async () => {
      await utils.task.getAll.invalidate();
    },
  });
  const deleteTask = api.task.deleteTask.useMutation({
    onMutate: async (deletedEntry) => {
      await utils.task.getAll.cancel();
      utils.task.getAll.setData(undefined, (prevEntries) => {
        return prevEntries!.filter((entry) => entry.id !== deletedEntry.id);
      });
    },
    onSettled: async () => {
      await utils.task.getAll.invalidate();
    },
  });

  if (isLoading) {
    return null;
  }

  if (taskEntries?.length === 0) {
    return <EmptyList addCallback={addCallback} />;
  }

  return (
    <div className="overflow-hidden bg-white shadow dark:bg-slate-800 sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {taskEntries?.map((task) => (
          <li key={task.id}>
            <span
              onDoubleClick={() => {
                updatePriority.mutate({
                  id: task.id,
                  priority: !task.priority,
                });
              }}
              className={`light:hover:bg-gray-50 block ${
                task.priority && "border-l-4 border-indigo-600"
              }`}
            >
              <div className="flex items-center px-4 py-4 sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="select-none truncate font-medium text-indigo-600">
                        {task.title}
                      </p>
                    </div>
                    <div className="mt-2 flex">
                      <div className="flex select-none items-center text-sm text-gray-500">
                        <CalendarIcon
                          className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                        <p>
                          Due at{" "}
                          <time dateTime={task.dueAt.toISOString()}>
                            {task.dueAt.toLocaleString()}
                          </time>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    deleteTask.mutate({
                      id: task.id,
                    });
                  }}
                  className="ml-5 block flex-shrink-0"
                >
                  <XMarkIcon
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const EmptyList = ({ addCallback }: HeaderProps) => {
  return (
    <div className="text-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
        No tasks
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
        Get started by creating a new task.
      </p>
      <div className="mt-6">
        <button
          onClick={() => addCallback()}
          type="button"
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          New Project
        </button>
      </div>
    </div>
  );
};

type FormProps = {
  isOpen: boolean;
} & HeaderProps;

const Form = ({ isOpen, addCallback }: FormProps) => {
  const utils = api.useContext();
  const [error, setError] = useState<string | undefined>(undefined);
  const createTask = api.task.createTask.useMutation({
    onSuccess: (newTask) => {
      if (!newTask) {
        setError("An error occurred creating a task.");
        return;
      }
      utils.task.getAll.setData(undefined, (prevEntries) => {
        if (prevEntries) {
          return [newTask, ...prevEntries];
        } else {
          return [newTask];
        }
      });
    },
  });
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState(false);
  const [dueAt, setDueAt] = useState<Date | undefined>(undefined);
  const actualAddCallback = () => {
    setTask("");
    setPriority(false);
    setDueAt(undefined);
    addCallback();
  };

  return (
    <>
      <Notification
        message={error}
        closeCallback={() => {
          setError(undefined);
        }}
      />
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={actualAddCallback}>
          <div className="fixed inset-0" />
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!task || !dueAt) {
                          setError("Not all fields are filled.");
                          return;
                        }
                        if (dueAt < new Date()) {
                          setError("The date specified is set in the past.");
                          return;
                        }
                        createTask.mutate({
                          dueAt,
                          priority,
                          title: task,
                        });
                        actualAddCallback();
                      }}
                      className="light:divide-gray-200 flex h-full flex-col divide-y bg-white shadow-xl dark:bg-slate-800"
                    >
                      <div className="h-0 flex-1 overflow-y-auto">
                        <div className="bg-indigo-700 py-6 px-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-white">
                              New Task
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                onClick={() => addCallback()}
                              >
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="divide-y divide-gray-200 px-4 sm:px-6">
                            <div className="space-y-6 pt-6 pb-5">
                              <div>
                                <label
                                  htmlFor="task"
                                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-white"
                                >
                                  Task
                                </label>
                                <div className="mt-2">
                                  <input
                                    onChange={(e) => {
                                      setTask(e.target.value);
                                    }}
                                    placeholder="Add Task"
                                    type="text"
                                    name="task"
                                    id="task"
                                    className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800 dark:text-white sm:text-sm sm:leading-6"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                                  Due at
                                </label>
                                <div className="mt-2">
                                  <DateTimePicker
                                    onChange={(e) => {
                                      setDueAt(e as Date);
                                    }}
                                    dropdownType="modal"
                                    placeholder="Pick Date & Time"
                                    radius={6}
                                    size="sm"
                                    timeInputProps={{
                                      "aria-label": "Pick date and time",
                                    }}
                                    submitButtonProps={{
                                      "aria-label": "Submit",
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-5">
                                <div className="relative flex items-start">
                                  <div className="flex h-6 items-center">
                                    <input
                                      onChange={(e) => {
                                        setPriority(e.target.checked);
                                      }}
                                      id="priority"
                                      aria-describedby="comments-description"
                                      name="comments"
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm leading-6">
                                    <label
                                      htmlFor="priority"
                                      className="font-medium text-gray-900 dark:text-white"
                                    >
                                      Priority
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 justify-end px-4 py-4">
                        <button
                          type="button"
                          className="light:ring-1 light:ring-inset light:ring-gray-300 light:hover:bg-gray-50 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                          onClick={() => actualAddCallback()}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="ml-4 inline-flex justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default Checklist;
