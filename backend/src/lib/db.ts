import { PrismaClient } from "../generated/prisma";



declare global {
  var prisma: PrismaClient | undefined;
}

const getPrismaInstance = () => {
  if (global.prisma) {
    return global.prisma;
  }
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient();
  }
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  return global.prisma;
};
export const prismaClient = getPrismaInstance();
