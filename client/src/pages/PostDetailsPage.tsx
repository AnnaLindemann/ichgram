import { useParams } from "react-router-dom";

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <section className="mx-auto w-full max-w-[935px] px-4 py-6">
      <h1 className="text-2xl font-semibold text-black">Post details</h1>

      <p className="mt-4 text-sm text-[#8e8e8e]">
        Temporary page for post: {id}
      </p>
    </section>
  );
}