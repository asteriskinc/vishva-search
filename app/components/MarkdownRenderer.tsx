import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Code } from "@nextui-org/code";
import { Card } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { Link } from "@nextui-org/link";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";

const MarkdownRenderer = ({ content }) => {
  const getMarkdownContent = () => {
    if (typeof content === 'string') {
      return content;
    }
    
    if (content && typeof content === 'object') {
      if ('markdown' in content) {
        return content.markdown;
      }
      return JSON.stringify(content);
    }
    
    return '';
  };

  const components = {
    // Headers with custom styling
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mt-6 mb-4 text-primary">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold mt-5 mb-3 text-primary-600">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium mt-4 mb-2 text-primary-500">
        {children}
      </h3>
    ),
    
    // Code blocks with syntax highlighting
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return (
          <Code 
            {...props} 
            className="px-1 py-0.5 mx-0.5 bg-default-100 text-default-800"
          >
            {children}
          </Code>
        );
      }
      return (
        <Card className="my-4 bg-default-50">
          <Code 
            {...props} 
            className="block p-4 rounded-lg text-sm whitespace-pre-wrap bg-default-50 text-default-800"
          >
            {children}
          </Code>
        </Card>
      );
    },

    // Custom blockquote styling
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic bg-default-50 py-2 rounded-r">
        {children}
      </blockquote>
    ),

    // Enhanced list styling
    ul: ({ children }) => (
      <ul className="list-disc list-inside my-4 space-y-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside my-4 space-y-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="ml-4">
        {children}
      </li>
    ),

    // Custom table rendering using NextUI components
    table: ({ children }) => (
      <Table 
        className="my-4"
        aria-label="Markdown table"
        shadow="none"
        classNames={{
          wrapper: "border border-default-200 rounded-lg"
        }}
      >
        {children}
      </Table>
    ),
    thead: ({ children }) => <TableHeader>{children}</TableHeader>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow>{children}</TableRow>,
    td: ({ children }) => (
      <TableCell className="py-2 px-4">
        {children}
      </TableCell>
    ),
    th: ({ children }) => (
      <TableColumn className="bg-default-100 font-semibold py-2 px-4">
        {children}
      </TableColumn>
    ),

    // Links with NextUI styling
    a: ({ href, children }) => (
      <Link 
        href={href}
        className="text-primary hover:text-primary-600 underline"
        showAnchorIcon
        target="_blank"
      >
        {children}
      </Link>
    ),

    // Horizontal rule with custom styling
    hr: () => <Divider className="my-6" />,

    // Paragraphs with proper spacing
    p: ({ children }) => (
      <p className="my-3 leading-relaxed text-default-700">
        {children}
      </p>
    ),

    // Images with better presentation
    img: ({ src, alt }) => (
      <div className="my-4">
        <img 
          src={src} 
          alt={alt} 
          className="rounded-lg max-w-full h-auto mx-auto shadow-lg" 
        />
        {alt && (
          <p className="text-center text-small text-default-500 mt-2">
            {alt}
          </p>
        )}
      </div>
    ),
  };

  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown components={components}>
        {getMarkdownContent()}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;