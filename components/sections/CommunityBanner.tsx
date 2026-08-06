import { Button } from "@/components/ui/button";

const WhatsAppIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.864-9.852.002-2.63-1.023-5.101-2.885-6.963C16.388 1.928 13.916.904 11.285.902c-5.439 0-9.863 4.417-9.867 9.853-.001 1.73.457 3.419 1.328 4.908l-.989 3.613 3.708-.973zm11.58-6.143c-.302-.15-1.788-.882-2.057-.98-.268-.099-.463-.149-.658.15-.195.299-.754.98-.925 1.178-.17.199-.341.224-.643.075-.302-.15-1.273-.469-2.427-1.498-.897-.8-1.502-1.787-1.678-2.087-.177-.3-.019-.462.13-.611.135-.134.302-.35.454-.523.151-.174.2-.299.302-.498.101-.2.05-.374-.025-.523-.075-.15-.658-1.588-.901-2.173-.236-.57-.497-.493-.68-.5-.187-.008-.401-.01-.614-.01s-.56.08-.853.4c-.293.32-1.12 1.1-1.12 2.68 0 1.58 1.147 3.11 1.307 3.32.16.21 2.257 3.45 5.47 4.83.763.329 1.36.526 1.822.673.768.243 1.467.209 2.02.127.616-.093 1.788-.732 2.042-1.44.254-.707.254-1.314.178-1.44-.076-.124-.268-.199-.57-.348z"/>
  </svg>
);

const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function CommunityBanner() {
  return (
    <section className="bg-[#FFF8F0] py-12 md:py-14 lg:py-16 xl:py-20 text-center">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-display font-[800] text-[26px] sm:text-[32px] lg:text-[38px] xl:text-[44px] leading-[1.1] text-[#13253D]">
            Ready to Connect With Women Travellers?
          </h2>
          <p className="text-[16px] md:text-[17px] text-[#3D4A5E] leading-relaxed">
            Join our vibrant community and start planning your next journey today.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="https://chat.whatsapp.com/IdH8AumJHbQ3A8th9VkQts?s=cl&p=a&mlu=1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full font-bold px-8 shadow-[0_8px_25px_-5px_rgba(37,211,102,0.4)] inline-flex items-center justify-center gap-2">
                <WhatsAppIcon className="w-5 h-5" />
                Join WhatsApp Community
              </Button>
            </a>
            <a 
              href="https://instagram.com/tripnaari" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button size="lg" className="w-full bg-[#FF4A7D] hover:bg-[#E63E6E] text-white rounded-full font-bold px-8 shadow-[0_8px_25px_-5px_rgba(255,74,125,0.4)] inline-flex items-center justify-center gap-2">
                <InstagramIcon className="w-5 h-5" />
                Follow on Instagram
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
