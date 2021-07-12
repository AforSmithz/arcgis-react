import { useState, useEffect, useRef } from "react";

export default function useInterval(callback, delay) {
  const savedCallback = useRef();
  const [id, setId] = useState(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      setId(setInterval(tick, delay));
      return () => clearInterval(id);
    }
  }, [delay]);

  return id;
}
