import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { HelpCircle, Book, MessageSquare, Mail, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const faqs = [
  { q: 'How do I add a new sale?', a: 'Go to "My Sales" from the sidebar, then click the "+ Add" button at the top right. Fill in the product, region, quantity, and price, then click "Add Sale".' },
  { q: 'How do I export my data?', a: 'On the "My Sales" page or dashboard, click the "Export" button. This downloads a CSV file with all your filtered sales data.' },
  { q: 'How does the forecast work?', a: 'The forecast uses linear regression on your historical sales data to predict future revenue trends. Go to the "Forecast" page to see 3-month projections.' },
  { q: 'How do I set targets?', a: 'Navigate to "Targets" from the sidebar. Click "+ New Target" to create a goal with a name, target value, and deadline.' },
  { q: 'How do I contact admin?', a: 'Use the "Messages" page to send a direct message to the admin team, or submit feedback through the "Feedback" page.' },
  { q: 'How do I change my password?', a: 'Go to "Settings" from the sidebar. Under the "Password" section, enter your current and new password, then click "Update Password".' },
  { q: 'Where are admin announcements?', a: 'Admin announcements appear in your "Notifications" page with an "Announcement" badge. You can filter notifications to show only announcements.' },
  { q: 'Can I edit my sales records?', a: 'Yes! On the "My Sales" page, click the edit icon on any row to modify the quantity. You can also delete records.' },
];

const guides = [
  { title: 'Getting Started Guide', desc: 'Learn the basics of navigating and using SalesIQ', icon: Book },
  { title: 'Understanding Your Dashboard', desc: 'Make the most of your analytics overview', icon: HelpCircle },
  { title: 'Sales Data Management', desc: 'How to add, edit, export, and filter sales records', icon: MessageSquare },
  { title: 'Setting & Tracking Goals', desc: 'Create targets and monitor your progress', icon: Mail },
];

export default function UserHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-2xl font-bold text-foreground">Help Center</h1><p className="text-sm text-muted-foreground">Guides, FAQs, and support resources</p></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((g, i) => (
            <div key={i} className="glass rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><g.icon className="h-5 w-5 text-primary" /></div>
                <div><h3 className="font-medium text-foreground">{g.title}</h3><p className="text-xs text-muted-foreground mt-1">{g.desc}</p></div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Frequently Asked Questions</h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border/50 rounded-lg overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors">
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-muted-foreground">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
