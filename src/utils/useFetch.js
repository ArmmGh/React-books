import { useState, useEffect } from "react";

export const useFetch = (refresh) => {
  const [data, setData] = useState({});
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);
  const url = "http://localhost:8000";

  useEffect(() => {
    const abortCtrl = new AbortController();
    if (!refresh) {
      return () => abortCtrl.abort();
    }
    Promise.all(
      [fetch(`${url}/genres`), fetch(`${url}/authors`), fetch(`${url}/books`)],
      { signal: abortCtrl.signal }
    )
      .then((res) => {
        if (res.some((el) => !el.ok)) {
          throw Error("could not fetch the data");
        }
        return Promise.all(res.map((res) => res.json()));
      })
      .then((data) => {
        setData({ genres: data[0], authors: data[1], books: data[2] });
        setIsPending(false);
        setError(null);
        abortCtrl.abort();
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("fetch aborted");
        } else {
          setIsPending(false);
          setError(err.message);
        }
      });

    return () => abortCtrl.abort();
  }, [refresh]);
  return { data, isPending, error };
};