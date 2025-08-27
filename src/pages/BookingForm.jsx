import React, { useState, useEffect, useCallback } from 'react';
import { getMasterUnit, getMasterMeetingRooms, getMasterJenisKonsumsi } from '../api';

const BookingForm = () => {
  const [units, setUnits] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [konsumsiList, setKonsumsiList] = useState([]);

  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoomCapacity, setSelectedRoomCapacity] = useState(0);

  const [tanggalRapat, setTanggalRapat] = useState(new Date().toISOString().split('T')[0]);
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [jumlahPeserta, setJumlahPeserta] = useState('');
  
  const [jenisKonsumsi, setJenisKonsumsi] = useState([]);
  const [nominalKonsumsi, setNominalKonsumsi] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const [unitRes, roomsRes, konsumsiRes] = await Promise.all([
          getMasterUnit(),
          getMasterMeetingRooms(),
          getMasterJenisKonsumsi(),
        ]);
        setUnits(unitRes.data);
        setAllRooms(roomsRes.data);
        setKonsumsiList(konsumsiRes.data);
      } catch (error) {
        console.error("Gagal mengambil data master:", error);
        setFetchError("Tidak dapat memuat data. Periksa koneksi internet Anda.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUnitChange = (e) => {
    const unitId = e.target.value;
    setSelectedUnitId(unitId);

    setSelectedRoomId('');
    setFilteredRooms([]);
    setSelectedRoomCapacity(0);

    if (unitId) {
      const roomsInUnit = allRooms.filter(room => room.officeId === unitId);
      setFilteredRooms(roomsInUnit);
    }
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    setSelectedRoomId(roomId);
    
    
    if (roomId) {
      const room = allRooms.find(r => r.id === roomId);
      setSelectedRoomCapacity(room?.capacity || 0);
    } else {
      setSelectedRoomCapacity(0);
    }
  };
  
  // menghitung konsumsi dan nominal secara otomatis
  const calculateKonsumsiAndNominal = useCallback(() => {
    if (!waktuMulai || !waktuSelesai || !jumlahPeserta || !konsumsiList.length) {
      setJenisKonsumsi([]);
      setNominalKonsumsi(0);
      return;
    }

    const startHour = parseInt(waktuMulai.split(':')[0], 10);
    const endHour = parseInt(waktuSelesai.split(':')[0], 10);
    const pesertaCount = parseInt(jumlahPeserta, 10) || 0;
    
    let determinedKonsumsi = new Set();
    let totalHargaPerOrang = 0;

    const konsumsiMapping = {
      snackSiang: konsumsiList.find(k => k.name.toLowerCase() === 'snack siang'),
      makanSiang: konsumsiList.find(k => k.name.toLowerCase() === 'makan siang'),
      snackSore: konsumsiList.find(k => k.name.toLowerCase() === 'snack sore'),
    };

    if (startHour < 11 && konsumsiMapping.snackSiang) {
      determinedKonsumsi.add(konsumsiMapping.snackSiang.name);
    }
    if (startHour < 14 && endHour > 11 && konsumsiMapping.makanSiang) {
      determinedKonsumsi.add(konsumsiMapping.makanSiang.name);
    }
    if (endHour > 14 && konsumsiMapping.snackSore) {
      determinedKonsumsi.add(konsumsiMapping.snackSore.name);
    }
    
    // Hitung total harga berdasarkan konsumsi yang terpilih
    if (determinedKonsumsi.has(konsumsiMapping.snackSiang?.name)) totalHargaPerOrang += konsumsiMapping.snackSiang.maxPrice;
    if (determinedKonsumsi.has(konsumsiMapping.makanSiang?.name)) totalHargaPerOrang += konsumsiMapping.makanSiang.maxPrice;
    if (determinedKonsumsi.has(konsumsiMapping.snackSore?.name)) totalHargaPerOrang += konsumsiMapping.snackSore.maxPrice;

    setJenisKonsumsi(Array.from(determinedKonsumsi));
    setNominalKonsumsi(totalHargaPerOrang * pesertaCount);

  }, [waktuMulai, waktuSelesai, jumlahPeserta, konsumsiList]);

  useEffect(() => {
    calculateKonsumsiAndNominal();
  }, [calculateKonsumsiAndNominal]);

  // Logika Validasi REAL-TIME
  useEffect(() => {
    const newErrors = {};
    const today = new Date();
    const selectedDate = new Date(tanggalRapat);
    const startDateTime = new Date(`${tanggalRapat}T${waktuMulai}`);
    const endDateTime = new Date(`${tanggalRapat}T${waktuSelesai}`);
    const peserta = parseInt(jumlahPeserta, 10);

    // Aturan 1: Waktu mulai tidak boleh lebih kecil dari tanggal hari ini
    if (selectedDate < today.setHours(0, 0, 0, 0)) {
        newErrors.tanggalRapat = "Tanggal rapat tidak boleh lebih kecil dari hari ini.";
    }

    // Aturan 2: Waktu mulai tidak boleh lebih besar dari waktu selesai
    if (waktuMulai && waktuSelesai && startDateTime >= endDateTime) {
      newErrors.waktuMulai = "Waktu mulai tidak boleh lebih besar atau sama dengan waktu selesai.";
    }

    // Aturan 3: Waktu selesai tidak boleh lebih kecil dari waktu mulai
    if (waktuSelesai && waktuMulai && endDateTime < startDateTime) {
      newErrors.waktuSelesai = "Waktu selesai tidak boleh lebih kecil dari waktu mulai.";
    }

    // Aturan 4: Jumlah peserta tidak boleh lebih besar dari kapasitas ruangan
    if (jumlahPeserta && selectedRoomCapacity > 0 && peserta > selectedRoomCapacity) {
      newErrors.jumlahPeserta = `Jumlah peserta tidak boleh lebih besar dari kapasitas ruangan (${selectedRoomCapacity}).`;
    }

    setErrors(newErrors);
  }, [tanggalRapat, waktuMulai, waktuSelesai, jumlahPeserta, selectedRoomCapacity]);


  const handleSubmit = async (e) => {
    e.preventDefault();

   
    const newErrors = {};
    const today = new Date();
    const selectedDate = new Date(tanggalRapat);
    const startDateTime = new Date(`${tanggalRapat}T${waktuMulai}`);
    const endDateTime = new Date(`${tanggalRapat}T${waktuSelesai}`);
    const peserta = parseInt(jumlahPeserta, 10);

    
    if (selectedDate < today.setHours(0, 0, 0, 0)) {
        newErrors.tanggalRapat = "Tanggal rapat tidak boleh lebih kecil dari hari ini.";
    }
    if (waktuMulai && waktuSelesai && startDateTime >= endDateTime) {
      newErrors.waktuMulai = "Waktu mulai tidak boleh lebih besar atau sama dengan waktu selesai.";
    }
    if (waktuSelesai && waktuMulai && endDateTime < startDateTime) {
      newErrors.waktuSelesai = "Waktu selesai tidak boleh lebih kecil dari waktu mulai.";
    }
    if (jumlahPeserta && selectedRoomCapacity > 0 && peserta > selectedRoomCapacity) {
      newErrors.jumlahPeserta = `Jumlah peserta tidak boleh lebih besar dari kapasitas ruangan (${selectedRoomCapacity}).`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Terdapat kesalahan pada form. Silakan periksa kembali.");
      return;
    }

    const newBooking = {
      unitId: selectedUnitId,
      roomId: selectedRoomId,
      tanggalRapat,
      waktuMulai,
      waktuSelesai,
      jumlahPeserta: parseInt(jumlahPeserta, 10),
      jenisKonsumsi,
      nominalKonsumsi
    };

    try {
      const savedData = await saveBooking(newBooking);
      alert("Pengajuan berhasil disimpan!");
      setSelectedUnitId('');
      setSelectedRoomId('');
      setWaktuMulai('');
      setWaktuSelesai('');
      setJumlahPeserta('');
      setJenisKonsumsi([]);
      setNominalKonsumsi(0);

    } catch (error) {
      alert("Gagal menyimpan pengajuan. Silakan coba lagi.");
    }
  };

  if (isLoading) return <div className="page-content"><h2>Memuat data...</h2></div>;
  if (fetchError) return <div className="page-content"><h2 style={{ color: 'red' }}>Error: {fetchError}</h2></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1><span className="back-arrow" onClick={() => window.history.back()}>❮</span> Pengajuan Perangkat</h1>
          <p className="breadcrumb">Pengajuan Perangkat &gt; Pengajuan Baru</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="card booking-form">
        <div className="form-section">
          <h2>Informasi Ruang Meeting</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Unit</label>
              <select value={selectedUnitId} onChange={handleUnitChange}>
                <option value="">-- Pilih Unit --</option>
                {units.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.officeName}</option>
                ))}
              </select>
            </div>
            <div className="form-group ">
              <label>Ruang Meeting</label>
              <select value={selectedRoomId} onChange={handleRoomChange} disabled={!selectedUnitId}>
                <option value="">-- {selectedUnitId ? 'Pilih Ruang Meeting' : 'Pilih Unit dulu'} --</option>
                {filteredRooms.map(room => (
                  <option key={room.id} value={room.id}>{room.roomName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Kapasitas</label>
              <input type="text" value={selectedRoomCapacity} disabled />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Informasi Rapat</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Tanggal Rapat *</label>
              <input type="date" value={tanggalRapat} onChange={e => setTanggalRapat(e.target.value)} />
              {errors.tanggalRapat && <p className="error-message">{errors.tanggalRapat}</p>}
            </div>
            <div className="form-group">
              <label>Waktu Mulai</label>
              <input type="time" value={waktuMulai} onChange={e => setWaktuMulai(e.target.value)} />
              {errors.waktuMulai && <p className="error-message">{errors.waktuMulai}</p>}
            </div>
            <div className="form-group">
              <label>Waktu Selesai</label>
              <input type="time" value={waktuSelesai} onChange={e => setWaktuSelesai(e.target.value)} />
              {errors.waktuSelesai && <p className="error-message">{errors.waktuSelesai}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Jumlah Peserta</label>
              <input type="number" value={jumlahPeserta} onChange={e => setJumlahPeserta(e.target.value)} placeholder="Masukkan Jumlah Peserta"/>
              {errors.jumlahPeserta && <p className="error-message">{errors.jumlahPeserta}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Konsumsi Rapat</label>
              <div className="checkbox-group">
                {konsumsiList.length > 0 ? konsumsiList.map(item => (
                  <div key={item.id}>
                    <input
                      type="checkbox"
                      id={`konsumsi-${item.id}`}
                      checked={jenisKonsumsi.includes(item.name)}
                      readOnly
                    />
                    <label htmlFor={`konsumsi-${item.id}`}>{item.name}</label>
                  </div>
                )) : <p>Data konsumsi tidak tersedia.</p>}
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Nominal Konsumsi</label>
              <input type="text" value={`Rp. ${nominalKonsumsi.toLocaleString('id-ID')}`} readOnly />
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-cancel">Batal</button>
          <button type="submit" className="btn btn-save">Simpan</button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;