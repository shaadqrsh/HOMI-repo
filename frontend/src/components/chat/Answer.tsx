"use client";
import useQuestionLoading from "@/store/useQuestionLoading";
import Image from "next/image";

import CodeBlock from "../CodeBlock";
import AnswerIcons from "./AnswerIcons";
import TypingEffect from "./TypingEffect";

export interface AnswerProps {
  answer: string;
  id: string;
}

type Segment = {
  type: "text" | "code";
  content: string;
  language?: string;
  inline?: boolean;
};

function formatRichText(text: string, baseKey: number): React.ReactNode[] {
  // Remove completely blank lines
  const lines = text.split("\n").filter(line => line.trim() !== "");
  const nodes: React.ReactNode[] = [];
  let bulletItems: React.ReactNode[] = [];
  let currentListType: "ol" | "ul" | null = null;

  function processInlineFormatting(line: string, keyBase: number): React.ReactNode[] {
    // Updated regex: supports inline code, bold-with-backticks, bold+italic, bold, italic, superscript (^...^) and subscript (~...~)
    const regex = /(`([^`]+?)`)|(\*\*`([^`]+?)`\*\*)|(\*\*\*([\s\S]+?)\*\*\*)|(\*\*([\s\S]+?)\*\*)|(\*([\s\S]+?)\*)|(\^([\s\S]+?)\^)|(~([\s\S]+?)~)/g;
    let lastIndex = 0;
    let partIndex = 0;
    const parts: React.ReactNode[] = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`${keyBase}-${partIndex++}`}>
            {line.slice(lastIndex, match.index)}
          </span>
        );
      }
      // Inline code (backticks): group 2
      if (match[2] !== undefined) {
        parts.push(
          <code
            key={`${keyBase}-${partIndex++}`}
            className="inline whitespace-nowrap font-mono text-xl text-slate-200 bg-gray-800 px-1 rounded"
          >
            {match[2]}
          </code>
        );
      }
      // Bold with backticks (**`...`**): group 4 → render as inline code.
      else if (match[4] !== undefined) {
        parts.push(
          <code
            key={`${keyBase}-${partIndex++}`}
            className="inline whitespace-nowrap font-mono text-xl text-slate-200 bg-gray-800 px-1 rounded"
          >
            {match[4]}
          </code>
        );
      }
      // Bold+Italic (triple asterisks): group 6
      else if (match[6] !== undefined) {
        parts.push(
          <strong key={`${keyBase}-${partIndex++}`}>
            <em>{match[6]}</em>
          </strong>
        );
      }
      // Bold (double asterisks): group 8
      else if (match[8] !== undefined) {
        parts.push(
          <strong key={`${keyBase}-${partIndex++}`}>
            {match[8]}
          </strong>
        );
      }
      // Italic (single asterisk): group 10
      else if (match[10] !== undefined) {
        parts.push(
          <em key={`${keyBase}-${partIndex++}`}>
            {match[10]}
          </em>
        );
      }
      // Superscript (^...^): group 12
      else if (match[12] !== undefined) {
        parts.push(
          <sup key={`${keyBase}-${partIndex++}`}>
            {match[12]}
          </sup>
        );
      }
      // Subscript (~...~): group 14
      else if (match[14] !== undefined) {
        parts.push(
          <sub key={`${keyBase}-${partIndex++}`}>
            {match[14]}
          </sub>
        );
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      parts.push(
        <span key={`${keyBase}-${partIndex++}`}>
          {line.slice(lastIndex)}
        </span>
      );
    }
    return parts;
  }  

  lines.forEach((line, index) => {
    // Match numeric (e.g., "1.") or asterisk bullet markers.
    const bulletMatch = line.match(/^\s*((\d+\.)|\*)\s+(.*)/);
    if (bulletMatch) {
      // Determine list type based on the bullet marker.
      const marker = bulletMatch[1];
      const listType = /^\d+\./.test(marker) ? "ol" : "ul";
      // If we haven't started a bullet group or the type has changed, initialize/reset.
      if (!currentListType) {
        currentListType = listType;
      }
      // If the current line's list type differs from the previous, flush the current bullet group.
      if (currentListType !== listType && bulletItems.length > 0) {
        nodes.push(
          currentListType === "ol" ? (
            <ol
              key={`ol-${baseKey}-${index}`}
              className="list-decimal list-outside pl-4 mt-3 mb-3 space-y-2"
            >
              {bulletItems}
            </ol>
          ) : (
            <ul
              key={`ul-${baseKey}-${index}`}
              className="list-disc list-outside pl-4 mt-3 mb-3 space-y-2"
            >
              {bulletItems}
            </ul>
          )
        );
        bulletItems = [];
        currentListType = listType;
      }
      // Add bullet item (group 3 is the content after the marker).
      bulletItems.push(
        <li
          key={`${baseKey}-${index}`}
          style={{ paddingLeft: "0.5em" }}
          className="mb-1"
        >
          {processInlineFormatting(bulletMatch[3], baseKey * 100 + index)}
        </li>
      );
    } else {
      // Flush any pending bullet items when a non-bullet line is encountered.
      if (bulletItems.length > 0) {
        nodes.push(
          currentListType === "ol" ? (
            <ol
              key={`ol-${baseKey}-${index}`}
              className="list-decimal list-outside pl-4 mt-3 mb-3 space-y-2"
            >
              {bulletItems}
            </ol>
          ) : (
            <ul
              key={`ul-${baseKey}-${index}`}
              className="list-disc list-outside pl-4 mt-3 mb-3 space-y-2"
            >
              {bulletItems}
            </ul>
          )
        );
        bulletItems = [];
        currentListType = null;
      }
      // Render non-bullet lines.
      nodes.push(
        <span key={`${baseKey}-${index}`} className="m-0 mb-3 block">
          {processInlineFormatting(line, baseKey * 100 + index)}
        </span>
      );
    }
  });
  // Flush any remaining bullet items.
  if (bulletItems.length > 0) {
    nodes.push(
      currentListType === "ol" ? (
        <ol
          key={`ol-${baseKey}-final`}
          className="list-decimal list-outside pl-4 mt-3 mb-3 space-y-2"
        >
          {bulletItems}
        </ol>
      ) : (
        <ul
          key={`ul-${baseKey}-final`}
          className="list-disc list-outside pl-4 mt-3 mb-3 space-y-2"
        >
          {bulletItems}
        </ul>
      )
    );
  }
  return nodes;
}

function parseAnswer(answer: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  // Only capture code blocks (triple backticks). Inline code remains in the text.
  const regex = /```(\w+)?\n([\s\S]+?)```/g;
  let match;
  while ((match = regex.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: answer.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: "code",
      language: match[1] || "",
      content: match[2],
      inline: false,
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < answer.length) {
    segments.push({
      type: "text",
      content: answer.slice(lastIndex),
    });
  }
  return segments;
}

const Answer = ({ answer, id }: AnswerProps) => {
  const { loading } = useQuestionLoading();
  const segments = parseAnswer(answer);

  // Group contiguous inline segments (text and inline code)
  // and flush block code segments as separate elements.
  const elements: React.ReactNode[] = [];
  let inlineGroup: { segment: Segment; key: number }[] = [];

  segments.forEach((segment, index) => {
    if (
      segment.type === "text" ||
      (segment.type === "code" && segment.inline)
    ) {
      inlineGroup.push({ segment, key: index });
    } else {
      // Flush any pending inline group.
      if (inlineGroup.length > 0) {
        elements.push(
          <span
            key={`inline-${inlineGroup[0].key}`}
            className="text-left mb-2"
          >
            {inlineGroup.map(({ segment, key }) =>
              segment.type === "code" ? (
                <code
                  key={key}
                  className="inline whitespace-nowrap font-mono text-xl text-slate-200 bg-gray-800 px-1 rounded"
                >
                  {segment.content}
                </code>
              ) : (
                formatRichText(segment.content, key)
              )
            )}
          </span>
        );
        inlineGroup = [];
      }
      // Render block code segments unchanged.
      elements.push(
        <CodeBlock
          key={index}
          language={segment.language || ""}
          code={segment.content}
        />
      );
    }
  });

  // Flush any remaining inline segments.
  if (inlineGroup.length > 0) {
    elements.push(
      <span
        key={`inline-${inlineGroup[0].key}`}
        className="text-left mb-2"
      >
        {inlineGroup.map(({ segment, key }) =>
          segment.type === "code" ? (
            <code
              key={key}
              className="inline whitespace-nowrap font-mono text-xl text-slate-200 bg-gray-800 px-1 rounded"
            >
              {segment.content}
            </code>
          ) : (
            formatRichText(segment.content, key)
          )
        )}
      </span>
    );
  }

  return (
    <section className="flex flex-col ml-1">
      <div className="mb-1 text-slate-200 font-normal text-lg flex gap-x-2 items-start group">
        <Image
          src="/HOMILOGO.png"
          alt="logo"
          width={20}
          height={20}
          className="mt-[4px]"
        />
        {loading[id] ? (
          <TypingEffect
            answer={answer}
            id={id}
          />
        ) : (
          <div className="w-full flex-col flex">{elements}</div>
        )}
      </div>
      {!loading[id] && <AnswerIcons answer={answer} />}
    </section>
  );
};

export default Answer;