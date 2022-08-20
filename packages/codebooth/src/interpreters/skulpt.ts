interface Skulpt {
  builtinFiles: {
    files: {
      [filename: string]: string;
    };
  };

  configure(o: {
    output(text: string): void;
    read(filename: string): string;
  }): void;

  importMainWithBody(
    name: string,
    dumpJS: boolean,
    body: string,
    canSuspend: boolean
  ): void;

  misceval: {
    asyncToPromise(callback: unknown): Promise<unknown>;
  };
}

declare const Sk: Skulpt;

export class PythonInterpreter {
  constructor() {
    this.read = this.read.bind(this);
  }

  read(filename: string): string {
    if (
      Sk.builtinFiles === undefined ||
      Sk.builtinFiles["files"][filename] === undefined
    )
      throw "File not found: '" + filename + "'";
    return Sk.builtinFiles["files"][filename];
  }

  run(code: string): Promise<string[]> {
    const output: string[] = [];
    Sk.configure({
      output: (txt) => {
        if (txt !== "\n") {
          output.push(txt);
        }
      },
      read: this.read,
    });

    return Sk.misceval
      .asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true))
      .then(() => output);
  }

  runSync(code: string): string[] {
    const output: string[] = [];
    Sk.configure({
      output: (txt: string) => {
        if (txt !== "\n") {
          output.push(txt);
        }
      },
      read: this.read,
    });

    Sk.importMainWithBody("<stdin>", false, code, false);
    return output;
  }
}
