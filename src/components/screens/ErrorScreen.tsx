import type { AppRouter } from "@/server/api/root";
import type { TRPCClientErrorLike } from "@trpc/client";
import { AlertTriangle } from "lucide-react";

const ErrorScreen = ({ error }: { error?: TRPCClientErrorLike<AppRouter> }) => {
  return (
    <div
      aria-label="Error screen"
      role="alert"
      className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4"
    >
      <AlertTriangle
        className="h-28 w-28 animate-pulse text-red-500"
        aria-hidden="true"
      />
      <h1 className="mt-4 line-clamp-1 text-2xl font-semibold text-red-400">
        {error?.message ?? "Something went wrong"}
      </h1>
      <table className="mt-2.5">
        <thead className="text-base font-medium text-gray-900 md:text-lg">
          <tr>
            <th>Try doing these:</th>
          </tr>
        </thead>
        <tbody className="text-base font-medium text-gray-700 md:text-lg">
          <tr>
            <td>1. Spine transfer to nosegrab frontflip</td>
          </tr>
          <tr>
            <td>2. Wall flip to natas spin</td>
          </tr>
          <tr>
            <td>3. Sticker slap to manual to wallplant</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ErrorScreen;
