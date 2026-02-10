// import { z } from "zod";
// import { baseProcedure, createTRPCRouter } from '../init';
// import { prisma } from "../../prisma/index";

// export const userRouter = createTRPCRouter({
//   add: baseProcedure
//     .input(
//       z.object({
//         email: z.email(),
//         password: z
//           .string()
//           .min(6)
//           .max(100)
//           .regex(
//             /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/
//           ),
//       })
//     )
//     .mutation(async ({ input }) => {
//       console.log("Adding user with email on server:", input.email);
//       try {
//         const hashedPassword = await hash(input.password, 10);
//         return await prisma.user.create({
//           data: {
//             email: input.email,
//             password: hashedPassword
//           },
//           select: {
//             id: true,
//             email: true,
//           },
//         });
//       } catch (error) {
//         throw new Error("Failed to create user");
//       }
//     }),
// });