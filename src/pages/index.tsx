import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api, type RouterOutputs } from "~/utils/api";

const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  console.log("user", user);

  return (
    <div className="flex w-full gap-3">
      <img
        src={user.profileImageUrl}
        alt="Profile Image"
        className="h-12 w-12 rounded-full"
      />
      <input
        placeholder="Type some emoji's"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex border-b border-slate-400 p-8">
      <img src={author.profileImageUrl} className="h-12 w-12 rounded-full" />
      <div className="flex flex-col">
        <div className="flex">
          <span>{`@${author.username}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const user = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <main className="">
        <div>
          {!user.isSignedIn && <SignInButton />}

          {!!user.isSignedIn && <CreatePostWizard />}
        </div>
        <div>
          {[...data, ...data]?.map((fullPost) => (
            <PostView {...fullPost} key={fullPost.post.id} />
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
