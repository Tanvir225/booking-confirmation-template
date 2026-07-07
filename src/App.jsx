import { useRef, useState } from 'react'
import './App.css'
import html2canvas from 'html2canvas';

function App() {
  // ── State ──
  const [formData, setFormData] = useState({
    agencyName: '',
    // reference: '',
    pnr: '',
    tripType: 'roundTrip', // default to roundTrip for Umrah/Return scenarios
    // Outbound Segment
    travelDate: '',
    flightNumber: '',
    routeFrom: '',
    routeTo: '',
    departureTime: '',
    arrivalTime: '',
    // Return Segment
    returnTravelDate: '',
    returnFlightNumber: '',
    returnRouteFrom: '',
    returnRouteTo: '',
    returnDepartureTime: '',
    returnArrivalTime: '',

    seats: '',
    farePerPax: '',
    currency: 'BDT',
    deadline: '',
    installment1: '',
    installment2: '',
    installment3: '',
    dueDate1: '',
    dueDate2: '',
    dueDate3: '',
    signatoryName: '',
    signatoryTitle: '',
    signatureDate: '',
  });

  const [isGenerated, setIsGenerated] = useState(false);
  const templateRef = useRef(null);

  // ── Calculations ──
  const totalFare = formData.seats * formData.farePerPax;
  const installmentAmount1 = (totalFare * formData.installment1) / 100;
  const installmentAmount2 = (totalFare * formData.installment2) / 100;
  const installmentAmount3 = (totalFare * formData.installment3) / 100;

  // ── Dynamic Installments (filter out empty ones) ──
  const installments = [
    { label: '1st Payment', percent: formData.installment1, amount: installmentAmount1, due: formData.dueDate1 },
    { label: '2nd Payment', percent: formData.installment2, amount: installmentAmount2, due: formData.dueDate2 },
    { label: '3rd Payment', percent: formData.installment3, amount: installmentAmount3, due: formData.dueDate3 },
  ].filter(item => item.percent > 0);

  // ── Handlers ──
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    return timeStr;
  };

  const generateTemplate = () => {
    setIsGenerated(true);
  };

  const downloadPNG = async () => {
    if (!templateRef.current) return;

    try {
      const element = templateRef.current;

      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById('template-content');
          if (clonedEl) {
            clonedEl.style.padding = '20px';
          }
        }
      });

      const padding = 20;
      const paddedCanvas = document.createElement('canvas');
      paddedCanvas.width = canvas.width + (padding * 2 * 3);
      paddedCanvas.height = canvas.height + (padding * 2 * 3);
      const ctx = paddedCanvas.getContext('2d');

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);

      ctx.drawImage(canvas, padding * 3, padding * 3);

      const link = document.createElement('a');
      link.download = `Flynas_Booking_${formData.reference || 'confirmation'}.png`;
      link.href = paddedCanvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading PNG:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      agencyName: '',
      pnr: '',
      tripType: 'roundTrip',
      travelDate: '',
      flightNumber: '',
      routeFrom: '',
      routeTo: '',
      departureTime: '',
      arrivalTime: '',
      returnTravelDate: '',
      returnFlightNumber: '',
      returnRouteFrom: '',
      returnRouteTo: '',
      returnDepartureTime: '',
      returnArrivalTime: '',
      seats: '',
      farePerPax: '',
      currency: 'BDT',
      deadline: '',
      installment1: '',
      installment2: '',
      installment3: '',
      dueDate1: '',
      dueDate2: '',
      dueDate3: '',
      signatoryName: '',
      signatoryTitle: '',
      signatureDate: '',
    });
    setIsGenerated(false);
  };

  return (
    <div className="min-h-screen bg-[#f4efe9] p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <h1 className="text-2xl font-semibold text-[#1a1a2e] flex items-center gap-3">
            <img src="/flynas-circle.png" alt="logo" className="w-10 h-10" />
            Flynas · Booking Generator
          </h1>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[450px,1fr] gap-8">
          {/* ─── FORM ─── */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#c9a84c]/15 md:sticky md:top-4 h-fit max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-[#1a0a2e]">Booking Details</h2>
            <p className="text-sm text-[#6b5f7a] mb-5 pb-4 border-b border-[#eeeae5]">
              Fill in the fields to generate your confirmation template.
            </p>

            <form className="space-y-2">
              {/* Agency Name */}
              <div>
                <label className="block text-xs font-semibold text-[#2d1b4e] mb-1">
                  Agency Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] focus:border-[#c9a84c] focus:ring-4 focus:ring-[#c9a84c]/15 outline-none transition"
                />
              </div>

              {/* Reference & Journey Type */}
              <div className="">

                {/* PNR Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b4e] mb-1">PNR</label>
                  <input
                    type="text"
                    name="pnr"
                    value={formData.pnr}
                    onChange={handleChange}
                    placeholder="HWMSD1"
                    className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] focus:border-[#c9a84c] focus:ring-4 focus:ring-[#c9a84c]/15 outline-none transition"
                  />
                </div>

                <label className="block text-xs font-semibold text-[#2d1b4e] mb-1 w-full">
                  Journey Type
                </label>
                <select
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] focus:border-[#c9a84c] focus:ring-4 focus:ring-[#c9a84c]/15 outline-none transition"
                >
                  <option value="oneWay">One Way</option>
                  <option value="roundTrip">Round Trip (Umrah)</option>
                </select>
              </div>

              {/* ── OUTBOUND FLIGHT SECTOR ── */}
              <div className="bg-[#01b1ae]/5 p-4 rounded-xl border border-[#01b1ae]/10 space-y-3">
                <div className="text-xs font-bold text-[#01b1ae] uppercase tracking-wider">Outbound Segment</div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">Travel Date *</label>
                    <input type="date" name="travelDate" value={formData.travelDate} onChange={handleChange} className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">Flight No *</label>
                    <input type="text" name="flightNumber" value={formData.flightNumber} onChange={handleChange} className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">From *</label>
                    <input type="text" name="routeFrom" value={formData.routeFrom} onChange={handleChange} className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">To *</label>
                    <input type="text" name="routeTo" value={formData.routeTo} onChange={handleChange} className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">Departure Time</label>
                    <input
                      type="text"
                      name="departureTime"
                      placeholder="14:30"
                      maxLength="5"
                      pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                      value={formData.departureTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">Arrival Time</label>
                    <input
                      type="text"
                      name="arrivalTime"
                      placeholder="14:30"
                      maxLength="5"
                      pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                      value={formData.arrivalTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── RETURN FLIGHT SECTOR (Umrah Conditional) ── */}
              {formData.tripType === 'roundTrip' && (
                <div className="bg-[#c9a84c]/5 p-4 rounded-xl border border-[#c9a84c]/20 space-y-3">
                  <div className="text-xs font-bold text-[#c9a84c] uppercase tracking-wider">Return Segment (Umrah)</div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">Return Date *</label>
                      <input type="date" name="returnTravelDate" value={formData.returnTravelDate} onChange={handleChange} className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">Flight No *</label>
                      <input type="text" name="returnFlightNumber" value={formData.returnFlightNumber} onChange={handleChange} className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">From *</label>
                      <input type="text" name="returnRouteFrom" value={formData.returnRouteFrom} onChange={handleChange} className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">To *</label>
                      <input type="text" name="returnRouteTo" value={formData.returnRouteTo} onChange={handleChange} className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">Departure Time</label>
                      <input
                        type="text"
                        name="returnDepartureTime"
                        placeholder="14:30"
                        maxLength="5"
                        pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                        value={formData.returnDepartureTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2d1b4e] mb-1">Arrival Time</label>
                      <input
                        type="text"
                        name="returnArrivalTime"
                        placeholder="16:45"
                        maxLength="5"
                        pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                        value={formData.returnArrivalTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-[#e2dad2] rounded-lg bg-white text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Seats + Fare */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b4e] mb-1">
                    Seats <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="seats"
                    value={formData.seats}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] focus:border-[#c9a84c] focus:ring-4 focus:ring-[#c9a84c]/15 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b4e] mb-1">
                    Fare/Pax <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="farePerPax"
                    value={formData.farePerPax}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] focus:border-[#c9a84c] focus:ring-4 focus:ring-[#c9a84c]/15 outline-none transition"
                  />
                </div>
              </div>

              {/* Currency + Deadline */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b4e] mb-1">
                    Currency <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] focus:border-[#c9a84c] focus:ring-4 focus:ring-[#c9a84c]/15 outline-none transition"
                  >
                    <option value="BDT">BDT</option>
                    <option value="USD">USD</option>
                    <option value="SAR">SAR</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2d1b4e] mb-1">
                    Deadline <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] focus:border-[#c9a84c] focus:ring-4 focus:ring-[#c9a84c]/15 outline-none transition"
                  />
                </div>
              </div>

              {/* Installments */}
              <div className="border-t border-[#eeeae5] pt-4 mt-2">
                <label className="block text-xs font-semibold text-[#2d1b4e] mb-2">
                  Payment Installments (%)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input type="number" name="installment1" value={formData.installment1} onChange={handleChange} min="0" max="100" className="w-full px-2 py-2 border border-[#e2dad2] rounded-xl bg-[#faf8f6] text-center text-sm outline-none" placeholder="%" />
                    <input type="date" name="dueDate1" value={formData.dueDate1} onChange={handleChange} className="w-full px-2 py-1.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] text-xs mt-1 outline-none" />
                  </div>
                  <div>
                    <input type="number" name="installment2" value={formData.installment2} onChange={handleChange} min="0" max="100" className="w-full px-2 py-2 border border-[#e2dad2] rounded-xl bg-[#faf8f6] text-center text-sm outline-none" placeholder="%" />
                    <input type="date" name="dueDate2" value={formData.dueDate2} onChange={handleChange} className="w-full px-2 py-1.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] text-xs mt-1 outline-none" />
                  </div>
                  <div>
                    <input type="number" name="installment3" value={formData.installment3} onChange={handleChange} min="0" max="100" className="w-full px-2 py-2 border border-[#e2dad2] rounded-xl bg-[#faf8f6] text-center text-sm outline-none" placeholder="%" />
                    <input type="date" name="dueDate3" value={formData.dueDate3} onChange={handleChange} className="w-full px-2 py-1.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] text-xs mt-1 outline-none" />
                  </div>
                </div>
              </div>

              {/* Signature Info */}
              <div className="border-t border-[#eeeae5] pt-4 mt-2">
                <label className="block text-xs font-semibold text-[#2d1b4e] mb-2">Signature Details</label>
                <div className="space-y-2">
                  <input type="text" name="signatoryName" value={formData.signatoryName} onChange={handleChange} placeholder="Full Name" className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="signatoryTitle" value={formData.signatoryTitle} onChange={handleChange} placeholder="Title" className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] outline-none" />
                    <input type="date" name="signatureDate" value={formData.signatureDate} onChange={handleChange} className="w-full px-4 py-2.5 border border-[#e2dad2] rounded-xl bg-[#faf8f6] outline-none" />
                  </div>
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-[#f5f0eb] rounded-xl p-4 flex justify-between items-center border border-[#e2dad2]">
                <span className="font-medium text-[#2d1b4e]">Total Fare</span>
                <span className="text-xl font-bold text-[#1a0a2e] font-serif">
                  {formData.currency} {formatNumber(totalFare)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button type="button" onClick={generateTemplate} className="flex-1 bg-[#1a0a2e] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2d1b4e] transition">
                  ✦ Generate Template
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-3.5 border border-[#d5cdc4] rounded-xl font-medium hover:bg-[#f5f0eb] transition">
                  ↺ Reset
                </button>
              </div>
            </form>
          </div>

          {/* ─── PREVIEW ─── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[#6b5f7a] bg-[#e8e0d8] px-4 py-1.5 rounded-full font-medium">⬇️ Preview</span>
              <button onClick={downloadPNG} disabled={!isGenerated} className={`px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 transition ${isGenerated ? 'bg-[#01b1ae] text-white hover:bg-[#019a97]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                Download PNG
              </button>
            </div>

            {/* Template Card Wrapper */}
            <div className="bg-white rounded-2xl md:p-5 shadow-lg border border-[#c9a84c]/12 ">
              {!isGenerated ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#b0a69b]">
                  <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h10v2H7zm0 4h6v2H7zm0-8h10v2H7z" /></svg>
                  <h3 className="text-lg font-semibold text-[#6b5f7a]">No template generated</h3>
                  <p className="text-sm">Fill in the form and click "Generate Template"</p>
                </div>
              ) : (
                <div ref={templateRef} id="template-content" className="w-full bg-white rounded-xl p-8 md:max-w-[800px] mx-auto" >
                  <div className="w-full flex flex-col bg-white ">

                    {/* Template Header */}
                    <div className="flex items-center justify-between pb-3 border-b-2 border-[#f0ebe5]">
                      <div className="flex items-center gap-3">
                        <img src="/flynas-circle.png" alt="logo" className="w-12 h-12 rounded-full" />
                        <div>
                          <div className="text-[#1a0a2e] font-bold md:text-2xl tracking-tight">
                            Flynas <span className="text-[#01b1ae]">·</span> Booking {formData.pnr ? 'Confirmed' : 'Confirmation' }
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#6b5f7a] font-medium">Date: {formatDate(formData.signatureDate)}</div>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 py-5 flex flex-col">
                      <div className="text-2xl font-semibold font-serif text-[#1a0a2e]">
                        Dear <span className="text-[#01b1ae]">{formData.agencyName}</span>,
                      </div>
                      {/* ── GREETING MESSAGE (conditional) ── */}
                      <div className="text-[14px] text-[#4a3d5a] text-justify font-medium mt-1 mb-4">
                        {formData.pnr ? (
                          <>
                            Your booking has been confirmed.
                            Please find your <strong>PNR</strong> and flight details below.
                          </>
                        ) : (
                          <>
                            Greetings from Flynas! We are pleased to confirm your group
                            with the following details. Please proceed with the payment as per the
                            installment plan outlined below.
                          </>
                        )}
                      </div>


                      {/* ── PNR DISPLAY (if provided) ── */}
                      {formData.pnr && (
                        <div className="mb-1">
                          <div className=" ">
                            <span className="text-xs font-medium text-[#6b5f7a]">PNR:</span>
                            <span className="ml-2 font-bold text-[#1a0a2e]">{formData.pnr}</span>
                          </div>
                        </div>
                      )}

                      {/* ── FLIGHT ITINERARY TABLE ── */}
                      <div className=" mb-2">
                        <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-[#01b1ae] border-y border-r ">
                          <div className="text-xs font-bold uppercase text-[#01b1ae] tracking-wider mb-2 flex justify-between">
                            <span>Flight Itinerary</span>
                            {/* Seats Allocation Footer */}

                            <span className="text-xs text-slate-800">
                              <span className="font-semibold ">{formData.seats}</span> Seats Allocated
                            </span>

                            <span className="font-bold font-sans normal-case text-[#01b1ae]">Confirmed</span>
                          </div>

                          {/* ── TABLE ── */}
                          <table className="w-full table-auto text-center">
                            <thead>
                              <tr className="bg-[#01b1ae]/10 border-b border-[#01b1ae]/20">
                                <th className="text-left py-2 px-2 text-[11px] font-bold uppercase tracking-wider text-[#2d1b4e]">FLT Date</th>
                                <th className="text-left py-2 px-2 text-[11px] font-bold uppercase tracking-wider text-[#2d1b4e]">FLT No</th>
                                <th className="text-left py-2 px-2 text-[11px] font-bold uppercase tracking-wider text-[#2d1b4e]">Route</th>
                                <th className="text-left py-2 px-2 text-[11px] font-bold uppercase tracking-wider text-[#2d1b4e]">Dep Time</th>
                                <th className="text-left py-2 px-2 text-[11px] font-bold uppercase tracking-wider text-[#2d1b4e]">Arv Time</th>
                                <th className="text-left py-2 px-2 text-[11px] font-bold uppercase tracking-wider text-[#2d1b4e]">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* Outbound Row */}
                              <tr className="border-b border-slate-200/60 hover:bg-white/50 transition">
                                <td className="py-2 px-2 font-semibold text-[#1a0a2e]">{formatDate(formData.travelDate)}</td>
                                <td className="py-2 px-2 font-semibold text-[#1a0a2e]">{formData.flightNumber || '—'}</td>
                                <td className="py-2 px-2 font-semibold text-[#1a0a2e]">{formData.routeFrom} → {formData.routeTo}</td>
                                <td className="py-2 px-2 text-[#1a0a2e]">{formatTime(formData.departureTime)}</td>
                                <td className="py-2 px-2 text-[#1a0a2e]">{formatTime(formData.arrivalTime)}</td>
                                <td className="py-2 px-2">
                                  <span className="inline-block px-2  text-green-700 text-[10px] font-semibold rounded-full">Outbound</span>
                                </td>
                              </tr>

                              {/* Return Row (only if roundTrip) */}
                              {formData.tripType === 'roundTrip' && (
                                <tr className="hover:bg-white/50 transition">
                                  <td className="py-2 px-2 font-semibold text-[#1a0a2e]">{formatDate(formData.returnTravelDate)}</td>
                                  <td className="py-2 px-2 font-semibold text-[#1a0a2e]">{formData.returnFlightNumber || '—'}</td>
                                  <td className="py-2 px-2 font-semibold text-[#1a0a2e]">{formData.returnRouteFrom} → {formData.returnRouteTo}</td>
                                  <td className="py-2 px-2 text-[#1a0a2e]">{formatTime(formData.returnDepartureTime)}</td>
                                  <td className="py-2 px-2 text-[#1a0a2e]">{formatTime(formData.returnArrivalTime)}</td>
                                  <td className="py-2 px-2">
                                    <span className="inline-block px-2 text-[#01b1ae] text-[10px] font-semibold rounded-full">Return (Umrah)</span>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>

                        </div>
                      </div>

                      {/* Total Pricing Row */}
                      {
                        !formData?.pnr && (
                          <div className="bg-gradient-to-r from-[#1a0a2e] to-[#2d1b4e] rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 mb-4">
                            <div>
                              <div className="text-xs font-medium text-white/70 uppercase tracking-wider">Total Combined Fare : {formData.seats} Pax * {formData.farePerPax} {formData.currency}</div>
                              <div className="text-2xl font-bold text-[#c9a84c] font-serif">
                                <span className="text-base font-semibold text-[#e8d5b0] mr-1">{formData.currency}</span>
                                {formatNumber(totalFare)}
                              </div>
                            </div>
                            <div className="rounded-full px-2 py-1">
                              <span className="text-xs text-white/90 font-medium">⏳ Pay Deadline: <strong className="text-white">{formatDate(formData.deadline)}</strong></span>
                            </div>
                          </div>
                        )
                      }

                      {/* ── DYNAMIC PAYMENT INSTALLMENT PLAN ── */}
                      {!formData.pnr && installments.length > 0 && (
                        <div className="bg-[#01b1ae] rounded-xl p-4 mb-4">
                          <div className="font-bold uppercase tracking-wider text-white mb-2.5 text-xs">📋 Payment Installment Plan</div>
                          <div className="flex flex-wrap gap-3">
                            {installments.map((item, idx) => (
                              <div key={idx} className="flex-1 min-w-[120px] bg-white rounded-xl p-3 text-center shadow-sm">
                                <div className="text-[11px] font-semibold text-[#6b5f7a]">{item.label} ({item.percent}%)</div>
                                <div className="text-sm font-bold text-[#01b1ae] my-0.5">
                                  {formData.currency} {formatNumber(item.amount)}
                                </div>
                                <div className="text-[10px] text-red-600 font-semibold">Due: {formatDate(item.due)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bank Specifications */}
                      {
                        !formData.pnr && (
                          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 mb-4">
                            <div className="font-bold uppercase tracking-wider text-teal-700 mb-1.5">Bank Transfer Details</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-slate-700">
                              <div><span className="text-slate-700">Bank Name : </span> <span className="font-semibold text-slate-900">HSBC BANGLADESH</span></div>
                              <div><span className="text-slate-700">Account : </span> <span className="font-semibold text-slate-900">Flynas Company</span></div>
                              <div><span className="text-slate-700">A/C No  : </span> <span className="font-semibold text-slate-900">007-046931-011</span></div>
                              <div><span className="text-slate-700">Swift : </span> <span className="font-semibold text-slate-900">HSBCBDDH</span></div>
                              <div><span className="text-slate-700">Routing : </span> <span className="font-semibold text-slate-900">115264636</span></div>
                              <div><span className="text-slate-700">Method : </span> <span className="font-semibold text-slate-900">RTGS</span></div>
                              <div className="col-span-2 mt-0.5"><span className="text-slate-700">Branch  : </span> <span className="text-slate-900">Uttara Branch, Giant Business Tower, Dhaka, Bangladesh</span></div>
                            </div>
                          </div>
                        )
                      }

                      {/* ── TERMS & CONDITIONS ── */}
                      <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Important Terms & Conditions</span>
                          <div className="flex-1 h-px bg-amber-200/60"></div>
                        </div>

                        <ul className="space-y-1.5 text-sm text-[#2d1b4e]">
                          <li className="flex items-start gap-2.5">
                            <span className="text-amber-500 text-base leading-5">•</span>
                            <span><strong className="font-semibold">Non-Refundable & Non-Changeable:</strong> Flynas tickets are non-refundable and non-changeable once issued.</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="text-amber-500 text-base leading-5">•</span>
                            <span><strong className="font-semibold">Child Fare Policy:</strong> We do not offer separate child fares. All passengers are charged at the applicable adult fare.</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="text-amber-500 text-base leading-5">•</span>
                            <span><strong className="font-semibold">Fare Availability:</strong> Fares are subject to availability at the time of booking and may change without prior notice.</span>
                          </li>
                          <li className="flex items-start gap-2.5">
                            <span className="text-amber-500 text-base leading-5">•</span>
                            <span><strong className="font-semibold">PNR Policy:</strong> The Passenger Name Record (PNR) is subject to change at any time without prior notice.</span>
                          </li>
                        </ul>

                        {/* Small footer note */}
                        <div className="mt-2.5 pt-2 border-t border-amber-200/40">
                          <p className="text-[10px] italic">
                            By proceeding with this booking, you agree to the above terms and conditions.
                          </p>
                        </div>
                      </div>

                      {/* Sign-off Segment */}
                      <div className="border-2 border-dashed border-[#d5cdc4] rounded-xl p-3">
                        <div className="text-xs font-bold  tracking-wider text-[#6b5f7a] mb-1">Best Regards</div>
                        <div className="text-base font-bold text-[#01b1ae]">{formData.signatoryName}</div>
                        <div className="text-xs font-medium text-slate-700">{formData.signatoryTitle}</div>
                        <div className="my-1.5"><img src="/signaturepng.png" alt="signature" className="h-12" /></div>
                        <div className='text-sm space-y-2'>
                          <p className='font-bold'>FLYNAS GSA BANGLADESH</p>
                          <p className=' font-light'> Rupayan Trade Centre | 1st  Floor <br />
                            114, Kazi Nazrul Islam Avenue | Bangla Motor | Dhaka-1205 | Bangladesh <br />
                            Tel: +88-02-41031062-64  Mob: +88 01859-666206</p>
                          <u className='cursor-pointer text-[#01b1ae]'>Email: flynasbd.dac@gmail.com  |  Web: www.flynas.com</u>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;