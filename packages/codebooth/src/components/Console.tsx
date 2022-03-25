import {useBoothStore} from "../store";

/** Component for displaying console logs. */
export function Console() {
  const useStore = useBoothStore();
  const messages = useStore(state => state.messages);

  return (
    <output className="lqv-console">
      {messages.map((m,i) => (<pre className={m.classNames.join(" ")} key={`${i}.${m.text}`}>{m.text}</pre>))}
    </output>
  );
}
