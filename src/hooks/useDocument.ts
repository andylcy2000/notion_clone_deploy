import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { useDebounce } from "use-debounce";

import type { Document } from "@/lib/types/db";

export const useDocument = () => {
  const { docId } = useParams();
  const documentId = Array.isArray(docId) ? docId[0] : docId;

  const [document, setDocument] = useState<Document | null>(null);
  const [dbDocument, setDbDocument] = useState<Document | null>(null);
  const [debouncedDocument] = useDebounce(document, 300);
  const router = useRouter();

  // When the debounced document changes, update the document
  useEffect(() => {
    const updateDocument = async () => {
      if (!debouncedDocument) return;
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: debouncedDocument.title,
          content: debouncedDocument.content,
        }),
      });
      if (!res.ok) {
        return;
      }
      const data: Document = await res.json();
      // Update the navbar if the title changed
      if (dbDocument?.title !== data.title) {
        router.refresh();
      }
      setDbDocument(data);
    };
    updateDocument();
  }, [debouncedDocument, documentId, router, dbDocument]);

  useEffect(() => {
    if (!documentId) return;
    const fetchDocument = async () => {
      const res = await fetch(`/api/documents/${documentId}`);
      if (!res.ok) {
        setDocument(null);
        router.push("/docs");
        return;
      }
      const data = await res.json();
      setDocument(data);
      setDbDocument(data);
    };
    fetchDocument();
  }, [documentId, router]);

  const title = document?.title || "";
  const setTitle = (newTitle: string) => {
    if (document === null) return;
    setDocument({
      ...document,
      title: newTitle,
    });
  };

  const content = document?.content || "";
  const setContent = (newContent: string) => {
    if (document === null) return;
    setDocument({
      ...document,
      content: newContent,
    });
  };

  return {
    documentId,
    document,
    title,
    setTitle,
    content,
    setContent,
  };
};
