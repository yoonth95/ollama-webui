import Loader from "@/shared/ui/loader";

type ArchiveLoaderProps = {
  loaderRef: (node?: Element | null) => void;
};

const ArchiveLoader = ({ loaderRef }: ArchiveLoaderProps) => {
  return <Loader loaderRef={loaderRef} variant="table-row" />;
};

export default ArchiveLoader;
