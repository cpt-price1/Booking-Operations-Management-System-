"use client"

import { useEffect, useState } from "react"

export default function Customers() {

  const [customers,setCustomers] = useState<any[]>([])
  const [name,setName] = useState("")
  const [phone,setPhone] = useState("")
  const [room,setRoom] = useState("")

  // LOAD DATA
  const loadCustomers = ()=>{
    fetch("http://localhost:5000/customers")
    .then(res=>res.json())
    .then(data=>setCustomers(data))
  }

  useEffect(()=>{
    loadCustomers()
  },[])

  // ADD CUSTOMER
  const addCustomer = ()=>{
    fetch("http://localhost:5000/addCustomer",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        name,
        phone,
        room
      })
    })
    .then(()=>{
      loadCustomers()
      setName("")
      setPhone("")
      setRoom("")
    })
  }

  return (
    <main className="p-10">

      <h1 className="text-3xl font-bold mb-5">Customers</h1>

      {/* FORM */}
      <div className="mb-6 space-y-3">

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e)=>setPhone(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="text"
          placeholder="Room"
          value={room}
          onChange={(e)=>setRoom(e.target.value)}
          className="border p-2 w-full"
        />

        <button
          onClick={addCustomer}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Customer
        </button>

      </div>

      {/* TABLE */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Room</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c,index)=>(
            <tr key={index}>
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.phone}</td>
              <td className="p-2">{c.room}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </main>
  )
}