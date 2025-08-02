
  // Dynamically import the correct admin page component based on the path
export default async function AdminPage({ params }) {
  const path = params.path?.join('/') || 'dashboard';
  
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
