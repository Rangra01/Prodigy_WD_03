export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">Local Store</span>
        <p className="footer-text">Your neighborhood retail store. Quality products, fair prices, cash on delivery.</p>
        <p className="footer-credit">&copy; {new Date().getFullYear()} Local Store. Built for customers.</p>
      </div>
    </footer>
  );
}
