"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Player {
  socketId: string;
  nickname: string;
  isOwner: boolean;
}

interface Room {
  code: string;
  players: Player[];
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [pingResponse, setPingResponse] = useState<string>("");
  const [roomCode, setRoomCode] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");

  // Room states
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [announcement, setAnnouncement] = useState<string>("");

  // Refs for focus management
  const roomHeaderRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000");

    socketInstance.on("connect", () => {
      setConnected(true);
      setErrorMessage("");
    });

    socketInstance.on("pong_server", (data: any) => {
      setPingResponse(`Sunucudan yanıt alındı: ${data.timestamp}`);
    });

    // Room response events
    socketInstance.on("room_created", ({ roomCode, players }: { roomCode: string; players: Player[] }) => {
      setCurrentRoom({ code: roomCode, players });
      setErrorMessage("");
      setAnnouncement(`Oda başarıyla oluşturuldu. Oda kodu: ${roomCode.split("").join(" ")}`);
      // Shift focus to the room heading for screen readers
      setTimeout(() => roomHeaderRef.current?.focus(), 100);
    });

    socketInstance.on("room_joined", ({ roomCode, players }: { roomCode: string; players: Player[] }) => {
      setCurrentRoom({ code: roomCode, players });
      setErrorMessage("");
      setAnnouncement(`${roomCode.split("").join(" ")} kodlu odaya katıldınız.`);
      // Shift focus to the room heading for screen readers
      setTimeout(() => roomHeaderRef.current?.focus(), 100);
    });

    socketInstance.on("room_error", ({ message }: { message: string }) => {
      setErrorMessage(message);
      setAnnouncement(`Hata: ${message}`);
      setTimeout(() => errorRef.current?.focus(), 100);
    });

    // Multiplayer room sync updates
    socketInstance.on("player_joined", ({ nickname: newPlayerName, players }: { nickname: string; players: Player[] }) => {
      setCurrentRoom((prev) => (prev ? { ...prev, players } : null));
      setAnnouncement(`${newPlayerName} odaya katıldı.`);
    });

    socketInstance.on("player_left", ({ nickname: leftPlayerName, players }: { nickname: string; players: Player[] }) => {
      setCurrentRoom((prev) => (prev ? { ...prev, players } : null));
      setAnnouncement(`${leftPlayerName} odadan ayrıldı.`);
    });

    socketInstance.on("room_closed", ({ message }: { message: string }) => {
      setCurrentRoom(null);
      setAnnouncement(message);
      alert(message);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
      setCurrentRoom(null);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendPing = () => {
    if (socket) {
      socket.emit("ping_server");
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMessage("Lütfen geçerli bir takma ad girin.");
      return;
    }
    if (socket) {
      socket.emit("create_room", { nickname: nickname.trim() });
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !roomCode.trim()) {
      setErrorMessage("Lütfen tüm alanları doldurun.");
      return;
    }
    if (socket) {
      socket.emit("join_room", {
        roomCode: roomCode.trim().toUpperCase(),
        nickname: nickname.trim(),
      });
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit("leave_room");
      setCurrentRoom(null);
      setAnnouncement("Odadan ayrıldınız.");
    }
  };

  const handleStartGame = () => {
    alert("Oyun başlatma özelliği yakında eklenecek!");
  };

  const myPlayer = currentRoom?.players.find((p) => p.socketId === socket?.id);

  return (
    <div className="space-y-8 py-6">
      {/* Dynamic Screen Reader Announcement Region */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {announcement}
      </div>

      {/* Connection status section (Semantic status indicator for screen readers) */}
      {!currentRoom && (
        <section 
          className="max-w-md mx-auto p-4 rounded-lg border border-gray-200 dark:border-zinc-800 text-center"
          aria-label="Sunucu Bağlantı Durumu"
        >
          <p className="font-medium text-sm">
            Sunucu Bağlantısı:{" "}
            <span 
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                connected ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              }`}
              aria-live="polite"
            >
              {connected ? "Bağlandı (Hazır)" : "Sunucu aranıyor..."}
            </span>
          </p>

          {connected && (
            <div className="mt-4 space-y-2">
              <button
                onClick={sendPing}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md font-semibold text-xs transition-colors"
                aria-describedby="ping-desc"
              >
                Bağlantıyı Test Et
              </button>
              <p id="ping-desc" className="sr-only">Sunucuyla olan bağlantıyı doğrulamak için ping atar.</p>
              {pingResponse && (
                <p className="text-xs text-green-600 dark:text-green-400" aria-live="assertive">
                  {pingResponse}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Display errors accessibly */}
      {errorMessage && (
        <div className="max-w-md mx-auto p-3 bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
          <p 
            ref={errorRef} 
            tabIndex={-1} 
            className="text-sm text-red-700 dark:text-red-400 font-medium focus:outline-none"
          >
            Hata: {errorMessage}
          </p>
        </div>
      )}

      {/* Main Screen Content Conditional Render */}
      {!currentRoom ? (
        // HOME VIEW: Create or Join Room
        <div className="space-y-8">
          <section className="text-center space-y-3" aria-labelledby="intro-heading">
            <h2 id="intro-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Tabu Oyun Odasına Hoş Geldiniz!
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              Görme engelli ve gören oyuncuların tamamen eşit koşullarda yarıştığı, erişilebilir kart oyunu platformu.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Create Room Form */}
            <section 
              className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4"
              aria-labelledby="create-room-heading"
            >
              <h3 id="create-room-heading" className="text-xl font-bold">Yeni Oda Kur</h3>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="create-nickname" className="block text-sm font-semibold">
                    Takma Adınız (Nickname)
                  </label>
                  <input
                    id="create-nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Örn: Can"
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent text-sm focus:ring-2 focus:ring-blue-500"
                    disabled={!connected}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!connected}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yeni Oda Oluştur
                </button>
              </form>
            </section>

            {/* Join Room Form */}
            <section 
              className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4"
              aria-labelledby="join-room-heading"
            >
              <h3 id="join-room-heading" className="text-xl font-bold">Odaya Katıl</h3>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="join-nickname" className="block text-sm font-semibold">
                    Takma Adınız (Nickname)
                  </label>
                  <input
                    id="join-nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Örn: Ebru"
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent text-sm focus:ring-2 focus:ring-blue-500"
                    disabled={!connected}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="join-room-code" className="block text-sm font-semibold">
                    Oda Kodu
                  </label>
                  <input
                    id="join-room-code"
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Örn: ABCD"
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent text-sm focus:ring-2 focus:ring-blue-500 uppercase"
                    disabled={!connected}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!connected}
                  className="w-full py-3 px-4 bg-zinc-800 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Giriş Yap
                </button>
              </form>
            </section>
          </div>
        </div>
      ) : (
        // LOBBY VIEW: Waiting for players to join
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-md space-y-6">
          <header className="border-b border-gray-200 dark:border-zinc-800 pb-4 text-center space-y-2">
            {/* H2 receives focus on transition. Pronounced clearly by screen readers */}
            <h2 
              ref={roomHeaderRef} 
              tabIndex={-1} 
              className="text-2xl font-bold focus:outline-none"
            >
              Lobi Bekleme Odası
            </h2>
            <p className="text-sm text-gray-500">
              Diğer oyuncuların katılmasını bekleyin.
            </p>
            <div className="inline-block bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 px-4 py-2 rounded-lg mt-2">
              <span className="text-sm block uppercase tracking-wider text-gray-500">Oda Kodu</span>
              <span 
                className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 select-all" 
                aria-label={`Oda kodu: ${currentRoom.code.split("").join(" ")}`}
              >
                {currentRoom.code}
              </span>
            </div>
          </header>

          {/* Player list */}
          <section className="space-y-4" aria-labelledby="lobby-players-title">
            <h3 id="lobby-players-title" className="font-bold text-lg">
              Oyuncular ({currentRoom.players.length})
            </h3>
            
            <ul className="divide-y divide-gray-100 dark:divide-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden list-none p-0">
              {currentRoom.players.map((player) => (
                <li 
                  key={player.socketId} 
                  className="p-3.5 flex justify-between items-center text-sm"
                >
                  <span className="font-medium">
                    {player.nickname} {player.socketId === socket?.id && <span className="text-gray-400 font-normal">(Siz)</span>}
                  </span>
                  {player.isOwner ? (
                    <span 
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold rounded-md"
                      aria-label="Oda Kurucusu"
                    >
                      Kurucu
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Katılımcı</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLeaveRoom}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl font-bold text-sm transition-colors"
            >
              Odadan Ayrıl
            </button>

            {myPlayer?.isOwner ? (
              <button
                onClick={handleStartGame}
                disabled={currentRoom.players.length < 2}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby={currentRoom.players.length < 2 ? "start-game-disabled-desc" : undefined}
              >
                Oyunu Başlat
              </button>
            ) : (
              <div 
                className="flex-1 py-3 px-4 bg-zinc-100 dark:bg-zinc-800 text-gray-500 rounded-xl font-medium text-sm text-center"
                aria-live="polite"
              >
                Kurucunun oyunu başlatması bekleniyor...
              </div>
            )}
          </div>

          {myPlayer?.isOwner && currentRoom.players.length < 2 && (
            <p id="start-game-disabled-desc" className="text-xs text-center text-gray-500">
              Oyuna başlamak için en az 2 oyuncu olmalıdır.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
