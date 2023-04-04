import clerkClient, { type User } from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user:User) => {
    return { id: user.id, username: user.username, profileImageUrl: user.profileImageUrl }
}

export const postsRouter = createTRPCRouter({
    // Public Procedure are func called without any auth validation
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
        take: 100,
    });

    const users = (await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId), limit:100
    })).map(filterUserForClient);

    return posts.map((post) =>  {
        const author = users.find((user) => user.id === post.authorId)

        if (!author) {
            console.error("AUTHOR NOT FOUND", post);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`,
            });
          }
          if (!author.username) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Author has no GitHub Account: ${author.id}`,
              });
          }
        return {
            post, author: {
                ...author,
                username: author.username ?? "(username not found)",
            }
        }
    })
  }),
});
