import { ContactsView } from "@/components/contacts-view";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <ContactsView />
    </main>
  );
}
