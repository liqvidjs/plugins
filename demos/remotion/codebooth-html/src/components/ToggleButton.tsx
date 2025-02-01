import "./ToggleButton.css";

import { useBoothStore } from "@lqv/codebooth";
import { useCallback, useEffect } from "react";
import { useStore } from "zustand";

export function ToggleButton(props: {
  className: string;

  title: string;
}) {
  const store = useBoothStore();

  // hack
  useEffect(() => {
    store.setState((prev) => ({
      classNames: [...prev.classNames, props.className],
    }));
  }, [props.className, store]);

  // toggle
  const onClick = useCallback(() => {
    store.setState((prev) => {
      if (prev.classNames.includes(props.className)) {
        return {
          classNames: prev.classNames.filter((cls) => cls !== props.className),
        };
      }
      return { classNames: [...prev.classNames, props.className] };
    });
  }, [props.className, store]);

  const active = useStore(store, (state) =>
    state.classNames.includes(props.className),
  );

  return (
    <button aria-pressed={active} className="lqv-cb-toggle" onClick={onClick}>
      <img alt="" src={`./eye-${active ? "open" : "shut"}.svg`} />
      {props.title}
    </button>
  );
}
