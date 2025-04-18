import { FileIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <FileIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-slate-700">MediRec</span>
          </div>
          <div className="text-sm text-slate-500">
            <span>© {new Date().getFullYear()} MediRec. All rights reserved.</span>
            <span className="px-2">|</span>
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <span className="px-2">|</span>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
