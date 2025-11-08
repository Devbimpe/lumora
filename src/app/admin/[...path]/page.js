export default async function AdminPage({ params }) {
  const resolvedParams = await params;
  const path = resolvedParams.path?.join('/') || 'dashboard';
  
  let PageComponent;
  try {
    PageComponent = (await import(`../../../../admin/${path}/page`)).default;
  } catch (error) {
    PageComponent = () => <div>Page not found</div>;
  }

  return (
    <PageComponent /> 
  );
}