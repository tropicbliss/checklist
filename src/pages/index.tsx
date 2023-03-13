import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

const Home: NextPage = () => {
  const { data: session } = useSession();

  return (
    <main>
      <div className="relative bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
          <div className="px-6 pt-10 pb-24 sm:pb-32 lg:col-span-7 lg:px-0 lg:pt-48 lg:pb-56 xl:col-span-6">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h1 className="mt-24 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:mt-10 sm:text-6xl">
                Keep track of your life today
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-400">
                Stay organized by providing a clear and structured way to keep
                track of tasks, events, and goals
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                {session ? (
                  <>
                    <button
                      onClick={() => {
                        signOut().catch(console.error);
                      }}
                      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Logout
                    </button>
                    <Link
                      href="/checklist"
                      className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
                    >
                      Checklist <span aria-hidden="true">→</span>
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      signIn("discord", {
                        callbackUrl: "/checklist",
                      }).catch(console.error);
                    }}
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Login with Discord
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
            <Image
              fill
              className="aspect-[3/2] w-full bg-gray-50 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
              src="https://images.unsplash.com/photo-1498758536662-35b82cd15e29?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2102&q=80"
              alt=""
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
