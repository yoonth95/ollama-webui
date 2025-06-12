import { LoaderCircle } from "lucide-react";

type ArchiveLoaderProps = {
  loaderRef: (node?: Element | null) => void;
};

const ArchiveLoader = ({ loaderRef }: ArchiveLoaderProps) => {
  return (
    <tr ref={loaderRef} className="text-muted-foreground text-center">
      <td colSpan={3} className="py-2">
        <LoaderCircle className="mx-auto h-6 w-6 animate-spin" />
      </td>
    </tr>
  );
};

export default ArchiveLoader;
