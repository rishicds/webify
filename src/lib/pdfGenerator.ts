import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface TicketData {
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
  userName: string;
  userEmail: string;
  qrCodeUrl: string;
  registrationId: string;
}


// This version uses html2canvas to screenshot the ticket card and save as PDF for WYSIWYG output
export const generateTicketPDF = async (ticketData: TicketData): Promise<void> => {
  // Find the ticket card element by a known id or class
  const ticketCard = document.querySelector('.ticket-pdf-card');
  if (!ticketCard) {
    alert('Ticket card not found on page.');
    return;
  }
  // Use html2canvas to render the card as an image
  const canvas = await html2canvas(ticketCard as HTMLElement, { backgroundColor: null, scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  // Calculate image size to fit nicely on A4 (smaller width for better fit)
  const pageWidth = pdf.internal.pageSize.getWidth();
  const maxImgWidth = 90; // mm, adjust as needed for your layout
  const scale = maxImgWidth / canvas.width * 4; // since canvas.width is in px, and we previously divided by 4
  const imgWidth = maxImgWidth;
  const imgHeight = (canvas.height / canvas.width) * imgWidth;
  const x = (pageWidth - imgWidth) / 2;
  const y = 30;
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
  const fileName = `ticket-${ticketData.eventTitle.replace(/\s+/g, '-').toLowerCase()}-${ticketData.registrationId.slice(-8)}.pdf`;
  pdf.save(fileName);
};
