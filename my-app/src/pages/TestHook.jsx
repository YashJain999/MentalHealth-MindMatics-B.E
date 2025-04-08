import { useState } from "react";

export default function TestHook() {
  const [count, setCount] = useState(0);
  return <div onClick={() => setCount(c => c + 1)}>Count: {count}</div>;
}
