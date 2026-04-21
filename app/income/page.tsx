export default function Income() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-5">Income</h1>

      <form className="space-y-4">

        <input
          type="text"
          placeholder="Customer Name"
          className="border p-2 w-full"
        />

        <input
          type="number"
          placeholder="Amount"
          className="border p-2 w-full"
        />

        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Income
        </button>

      </form>
    </main>
  )
}