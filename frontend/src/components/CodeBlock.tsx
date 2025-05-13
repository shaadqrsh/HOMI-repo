import hljs from "highlight.js";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="relative w-full">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-4 z-10 text-white hover:opacity-25 transition"
      >
        {copied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
      </button>
      <pre className="w-full dark:bg-liberty-blue p-0 overflow-auto rounded-lg">
        <code
          ref={codeRef}
          className={language}
        >
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
