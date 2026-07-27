import LibraryClient from "@/components/portal/funeral/LibraryClient";
import { requireSection } from "@/lib/portal/guard";
import { getDocuments } from "@/lib/portal/funeral/data";

export default async function LibraryPage() {
  await requireSection("library");
  const documents = await getDocuments();
  return <LibraryClient documents={documents} />;
}
