
import { toast } from "sonner";

// import { useState } from "react";

// const useFetch = (cb:any) => {
//   const [data, setData] = useState(undefined);
//   const [loading, setLoading] = useState<boolean | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const fn = async (...args:any) => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await cb(...args);
//       setData(response);
//       setError(null);
//     } catch (error:unknown) {
//       const message = error instanceof Error ? error.message : String(error);
//       setError(message);
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { data, loading, error, fn, setData };
// };

// export default useFetch;

// hooks/use-fetch.ts

import { useState } from "react";

export default function useFetch<T = any>(fn: (...args: any[]) => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);

  const call = async (...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fn: call,
    data,
    error,
  };
}
