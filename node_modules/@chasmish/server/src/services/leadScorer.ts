import { Business } from '../types';

export function calculateQualityScore(biz: Partial<Business>): number {
  let score = 0;

  // Has phone number
  if (biz.phone) score += 20;

  // Has email
  if (biz.email) score += 15;

  // Has social media
  if (biz.instagram_url || biz.facebook_url) score += 10;

  // Has description
  if (biz.description) score += 10;

  // Website confirmed absent (best lead)
  if (biz.website_status === 'no_website') score += 30;

  // Has Google Maps presence
  if (biz.google_maps_url) score += 10;

  // Has address
  if (biz.address) score += 5;

  return Math.min(score, 100);
}

export function generatePitch(
  biz: Business,
  channel: 'whatsapp' | 'instagram' | 'email',
  agencyName = 'Our Agency',
  services: string[] = ['website development', 'digital marketing']
): string {
  const serviceList = services.join(', ');
  const firstName = biz.name.split(' ')[0];

  if (channel === 'whatsapp') {
    return `Hi! 👋 I came across *${biz.name}* and noticed you don't have an official website yet.

We're *${agencyName}* — a digital agency specialising in ${serviceList}.

We'd love to help *${firstName}* establish a strong online presence that attracts more customers 🚀

Would you be open to a quick chat? We offer free consultations! 😊`;
  }

  if (channel === 'instagram') {
    return `Hey ${firstName}! 👋 Love what you're doing at ${biz.name}! 🔥

We noticed you're growing your brand here on Instagram — have you considered taking it to the next level with your own professional website?

At ${agencyName}, we build stunning websites & digital solutions for businesses like yours. Let's connect! 💬

DM us anytime or check our profile for more info. 🙌`;
  }

  // email
  return `Subject: Help ${biz.name} Grow Online — Free Consultation

Dear ${biz.name} Team,

My name is [Your Name] from ${agencyName}. I came across your business and was impressed by what you offer.

I noticed that ${biz.name} doesn't currently have an official website. In today's digital-first world, having a professional online presence can dramatically increase your customer reach and credibility.

At ${agencyName}, we specialise in ${serviceList} — tailored specifically for businesses like yours.

Here's what we can offer:
✅ Professional website design & development
✅ Mobile-friendly & fast-loading pages
✅ Search engine optimisation (SEO)
✅ Social media management
✅ AI-powered automation tools

We'd love to offer you a FREE 30-minute consultation to discuss how we can help ${biz.name} grow online.

Looking forward to hearing from you.

Best regards,
[Your Name]
${agencyName}
[Your Phone] | [Your Email]`;
}

