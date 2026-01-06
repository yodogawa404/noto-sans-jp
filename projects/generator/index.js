import unicode_ranges from "@yodogawa404/get-unicode-chunk-range_jp/jp.json" with { type: "json" };

import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const __dirname = import.meta.dirname;

const source_files = {
  400: __dirname + "/../../resources/OTF/NotoSansCJKjp-Regular.otf",
  700: __dirname + "/../../resources/OTF/NotoSansCJKjp-Bold.otf",
};

const distFontDirName = __dirname + "/../noto-sans-jp/fonts/";
const distCSSFileName = __dirname + "/../noto-sans-jp/index.css";

const OTF_files = [];
const woff2_files = [];

function getUnicodesString(arr) {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    if (i == arr.length - 1) {
      str = str + arr[i];
    } else str = str + arr[i] + ",";
  }

  return str;
}

{
  /* Stage1: Split OTF files */

  Object.keys(source_files).map((key) => {
    for (let i_unicode = 0; i_unicode < unicode_ranges.length; i_unicode++) {
      let unicodes = getUnicodesString(unicode_ranges[[i_unicode]]);

      const distFileName = `noto-sans-jp_${key}-${String(i_unicode).padStart(3, "0")}`;
      const distFileExt = ".otf";
      console.log(
        execFileSync("hb-subset", [
          source_files[key],
          `--unicodes=${unicodes}`,
          "--layout-features=*",
          `--output-file=${distFontDirName + distFileName + distFileExt}`,
        ]),
      );

      OTF_files.push(distFontDirName + distFileName + distFileExt);
      woff2_files.push({
        filename: distFileName + ".woff2",
        weight: key,
        unicodes: unicodes,
      });
    }
  });
}

{
  /* Stage2: Convert OTF files to woff2 */

  for (let i = 0; i < OTF_files.length; i++) {
    execFileSync("woff2_compress", [OTF_files[i]]);
    execFileSync("rm", [OTF_files[i]]);
  }
}

{
  /* Stage3: Generate CSS file */

  let full_css = "";

  for (let i = 0; i < woff2_files.length; i++) {
    full_css =
      full_css +
      `@font-face {font-family: 'Noto Sans JP';font-display: swap;font-weight: ${woff2_files[i]["weight"]};src: url(./fonts/${woff2_files[i]["filename"]}) format('woff2');unicode-range: ${woff2_files[i]["unicodes"]}}\n`;
  }

  writeFileSync(distCSSFileName, full_css);
}
