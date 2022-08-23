function templateString(strings, ...keys) {
  return (...values: string[]): string => {
    const result = [strings[0]];
    keys.forEach((key, i) => {
      result.push(values[key], strings[i + 1]);
    });
    return result.join("");
  };
}

export const file = `function Component() {
  return <h1>Hello World!</h1>;
}
`;

export const tsxTemplate = templateString`const {createRoot} = ReactDOM;

${0}

createRoot(document.querySelector("main")).render(<Component />)`;

export const htmlTemplate = templateString`<html>
<body>
  <main></main>
  
  <script crossorigin defer src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
  <script crossorigin defer src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  <script defer>window.addEventListener("DOMContentLoaded", () => {${0}});</script>
</body>
</html>`;
