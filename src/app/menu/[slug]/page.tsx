export default function MenuPage({ params }: { params: { slug: string } }) {
  return (
    <main>
      <h1>قائمة المطعم: {params.slug}</h1>
    </main>
  )
}