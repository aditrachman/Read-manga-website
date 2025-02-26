import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen text-white flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12">
      {/* Kiri: Teks & Tombol */}
      <div className="max-w-xl text-center md:text-left relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Baca Manga <br /> Terlengkap <br /> dan No Iklan
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Website baca manga Terlengkap dan No Iklan bikin kamu baca
        </p>

        {/* Tombol */}
        <div className="mt-6 flex justify-center md:justify-start space-x-4">
          <button className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-80">
            Discover
          </button>
          <button className="border border-gray-400 px-5 py-2 text-sm font-semibold text-white rounded-md hover:bg-gray-800">
            Create
          </button>
        </div>

        {/* Statistik */}
        <div className="mt-8 flex flex-wrap gap-6 justify-center md:justify-start">
          <div className="bg-gray-800/50 px-4 py-2 rounded-lg text-center">
            <p className="text-xl font-bold">27k+</p>
            <p className="text-sm text-gray-400">Artworks</p>
          </div>
          <div className="bg-gray-800/50 px-4 py-2 rounded-lg text-center">
            <p className="text-xl font-bold">20k+</p>
            <p className="text-sm text-gray-400">Auctions</p>
          </div>
          <div className="bg-gray-800/50 px-4 py-2 rounded-lg text-center">
            <p className="text-xl font-bold">7k+</p>
            <p className="text-sm text-gray-400">Artists</p>
          </div>
        </div>
      </div>

      {/* Kanan: Card NFT */}
      <div className="relative w-80 md:w-96 h-[480px] rounded-3xl shadow-2xl overflow-hidden border-2 ">
        <div className="relative rounded-3xl bg-gray-900 overflow-hidden h-full">
          {" "}
          {/* Tambahkan h-full */}
          <Image
            src="/cover.jpg"
            alt="Manga Cover"
            fill
            style={{ objectFit: "cover" }}
            className="rounded-3xl"
            unoptimized
          />
          {/* Overlay Gelap */}
          <div className="absolute inset-0 bg-black/40 rounded-3xl"></div>
          {/* Informasi di bawah */}
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent rounded-b-3xl text-white">
            <div className="flex justify-between text-sm md:text-base">
              <div>
                <p className="text-gray-300">Ending in:</p>
                <p className="font-semibold text-lg">1h 20m 30s</p>
              </div>
              <div className="text-right">
                <p className="text-gray-300">Highest Bid</p>
                <p className="font-semibold text-lg">32.4 ETH</p>
              </div>
            </div>

            {/* Tombol */}
            <div className="mt-4 flex space-x-3">
              <button className="flex-1 bg-purple-600 text-white py-2 text-sm rounded-lg hover:bg-purple-700 transition shadow-lg">
                Place a Bid
              </button>
              <button className="flex-1 border border-gray-400 text-white py-2 text-sm rounded-lg hover:bg-gray-800 transition shadow-lg">
                Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
