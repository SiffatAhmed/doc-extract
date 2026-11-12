import type { Status } from "../types";

export function StatusMessage({ status }: { status: Status }) {
  return (
    <div className={status.isError ? "status err" : "status"} role="status">
      {status.message}
    </div>
  );
}
