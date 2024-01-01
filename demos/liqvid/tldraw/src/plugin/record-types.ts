import type {TLCamera, TLInstance, TLRecord, TLShape} from "@tldraw/tldraw";

export function isCamera(data: TLRecord): data is TLCamera {
  return data.typeName === "camera";
}

export function isInstance(
  key: string,
  _data: unknown,
): _data is {u: TLInstance} {
  return key === "instance";
}

export function isPointer(data: unknown[]): data is [number, number] {
  return (
    data.length === 2 &&
    typeof data[0] === "number" &&
    typeof data[1] === "number"
  );
}

export function isShape(key: string, _data: unknown): _data is TLShape {
  return key.startsWith("shape:");
}
