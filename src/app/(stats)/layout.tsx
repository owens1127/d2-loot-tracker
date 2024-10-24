export const dynamic = "force-static";
export const revalidate = 15 * 60;

export default function Loading({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
