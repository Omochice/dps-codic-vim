export interface CodicResponse {
  successful: boolean;
  text: string;
  "translated_text": string;
  words: CodicEachRensponse[];
}

interface CodicEachRensponse {
  successful: boolean;
  text: string;
  "translated_text": string;
  candidates: Record<"text", string>[];
}

export type Casing =
  | "camel"
  | "pascal"
  | "lower_underscore"
  | "upper_underscore"
  | "hyphen";

export type AcronymStyle =
  | "MS_naming_guidelines"
  | "camel_strict"
  | "literal";

export async function codic(
  texts: string[],
  token: string,
  options: {
    projectId?: string;
    casing?: Casing;
    acronymStyle?: AcronymStyle;
  } = {},
): Promise<CodicResponse[]> {
  if (texts.length >= 4) {
    throw new Error(`The number of texts must be 3 or less.`);
  }
  const url = "https://api.codic.jp/v1/engine/translate.json";

  const res = await fetch(url, {
    headers: new Headers({
      Authorization: `Bearer ${token}`,
    }),
    body: new URLSearchParams(
      JSON.parse(JSON.stringify({ // undefinedの除去
        text: texts.join("\n"),
        project_id: options.projectId || undefined,
        casing: options.casing || undefined,
        acronym_style: options.acronymStyle || undefined,
      })),
    ),
    method: "POST",
  });
  if (res.status != 200) {
    throw new Error(`The response status is ${res.status}(${res.statusText}).`);
  }
  return await res.json();
}
