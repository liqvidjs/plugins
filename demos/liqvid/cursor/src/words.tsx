export function Words() {
  return (
    <>
      <span id="watch">Look, you can point at things</span>
      <svg id="targets" viewBox="-5 -2.5 10 5">
        <circle cx="-4" cy="2" r="0.03" fill="red"/>
        <circle cx="-2" cy="-2" r="0.03" fill="blue"/>
        <circle cx="0" cy="2" r="0.03" fill="green"/>
        <circle cx="2" cy="-2" r="0.03" fill="purple"/>
        <circle cx="4" cy="2" r="0.03" fill="pink"/>
      </svg>
    </>
  );
}
