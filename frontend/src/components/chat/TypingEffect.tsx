"use client";
import useQuestionLoading from "@/store/useQuestionLoading";
import { useEffect, useRef, useState } from "react";
import CodeBlock from "../CodeBlock";

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
    // Updated regex: supports inline code, bold+italic, bold, italic, superscript (^...^) and subscript (~...~)
    const regex = /(`([^`]+?)`)|(\*\*\*([\s\S]+?)\*\*\*)|(\*\*([\s\S]+?)\*\*)|(\*([\s\S]+?)\*)|(\^([\s\S]+?)\^)|(~([\s\S]+?)~)/g;
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
      // Bold+Italic (triple asterisks): group 4
      else if (match[4] !== undefined) {
        parts.push(
          <strong key={`${keyBase}-${partIndex++}`}>
            <em>{match[4]}</em>
          </strong>
        );
      }
      // Bold (double asterisks): group 6
      else if (match[6] !== undefined) {
        parts.push(
          <strong key={`${keyBase}-${partIndex++}`}>
            {match[6]}
          </strong>
        );
      }
      // Italic (single asterisk): group 8
      else if (match[8] !== undefined) {
        parts.push(
          <em key={`${keyBase}-${partIndex++}`}>
            {match[8]}
          </em>
        );
      }
      // Superscript (^...^): group 10
      else if (match[10] !== undefined) {
        parts.push(
          <sup key={`${keyBase}-${partIndex++}`}>
            {match[10]}
          </sup>
        );
      }
      // Subscript (~...~): group 12
      else if (match[12] !== undefined) {
        parts.push(
          <sub key={`${keyBase}-${partIndex++}`}>
            {match[12]}
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
      // Initialize currentListType if needed.
      if (!currentListType) {
        currentListType = listType;
      }
      // Flush bullet items if list type has changed.
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
      // Flush pending bullet items when a non-bullet line is encountered.
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
      // Render non-bullet line.
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

const TypingEffect = ({ answer, id }: AnswerProps) => {
  const { loading, changeLoading } = useQuestionLoading();
  const segments = parseAnswer(answer);
  const bottomRef = useRef<HTMLDivElement>(null);
  const totalChars = segments.reduce((sum, seg) => sum + seg.content.length, 0);
  const [globalCount, setGlobalCount] = useState(0);

  useEffect(() => {
    if (globalCount < totalChars) {
      const timeout = setTimeout(() => {
        setGlobalCount((prev) => Math.min(prev + 25, totalChars));
      }, 20); // Adjust speed (ms per 25 characters) here.
      return () => clearTimeout(timeout);
    } else {
      changeLoading(id, false);
    }
  }, [globalCount, totalChars, id, changeLoading]);

  let remainingChars = globalCount;
  const renderedElements: React.ReactNode[] = [];
  let inlineGroup: { segment: Segment; content: string; key: number }[] = [];

  segments.forEach((segment, index) => {
    const segLength = segment.content.length;
    let displayedContent = "";
    if (remainingChars >= segLength) {
      displayedContent = segment.content;
      remainingChars -= segLength;
    } else {
      displayedContent = segment.content.slice(0, remainingChars);
      remainingChars = 0;
    }
    if (segment.type === "text" || (segment.type === "code" && segment.inline)) {
      inlineGroup.push({ segment, content: displayedContent, key: index });
    } else {
      if (inlineGroup.length > 0) {
        renderedElements.push(
          <p key={`inline-${inlineGroup[0].key}`} className="text-left mb-2">
            {inlineGroup.map(({ segment, content, key }) =>
              segment.type === "code" ? (
                <code
                  key={key}
                  className={`inline whitespace-nowrap font-mono text-xl text-slate-200 ${
                    content === segment.content ? "bg-gray-800 px-1 rounded" : ""
                  }`}
                >
                  {content}
                </code>
              ) : (
                formatRichText(content, key)
              )
            )}
          </p>
        );
        inlineGroup = [];
      }
      if (displayedContent === segment.content) {
        renderedElements.push(
          <CodeBlock
            key={index}
            language={segment.language || ""}
            code={displayedContent}
          />
        );
      } else {
        renderedElements.push(
          <pre
            key={index}
            className="whitespace-pre-wrap font-mono text-xl text-slate-200"
          >
            {displayedContent}
          </pre>
        );
      }
    }
  });
  if (inlineGroup.length > 0) {
    renderedElements.push(
      <p key={`inline-${inlineGroup[0].key}`} className="text-left mb-2">
        {inlineGroup.map(({ segment, content, key }) =>
          segment.type === "code" ? (
            <code
              key={key}
              className={`inline whitespace-nowrap font-mono text-xl text-slate-200 ${
                content === segment.content ? "bg-gray-800 px-1 rounded" : ""
              }`}
            >
              {content}
            </code>
          ) : (
            formatRichText(content, key)
          )
        )}
      </p>
    );
  }

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [renderedElements]);

  return (
    <div className="w-full flex-col flex">
      <span>{renderedElements}</span>
      <div ref={bottomRef} />
    </div>
  );
};

export default TypingEffect;