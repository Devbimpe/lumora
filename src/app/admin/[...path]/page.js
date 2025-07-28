
export default async function AdminPage({ params }) {
  const path = params.path?.join('/') || 'dashboard';
  
  // Dynamically import the correct page component
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
