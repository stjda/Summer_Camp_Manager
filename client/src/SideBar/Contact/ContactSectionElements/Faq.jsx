import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const faqData = [
  { question: "What are your hours?", answer: "We are open Monday to Friday, 9 AM to 5 PM." },
  { question: "Do you offer online services?", answer: "Yes, we offer a range of online services." },
  { question: "How can I make an appointment?", answer: "You can book an appointment through our website or by calling us." },
  { question: "What is your cancellation policy?", answer: "We require 24 hours notice for cancellations." },
];

export const FAQAccordion = () => {
  return (
    <>
      <Typography variant="h4" align="center" gutterBottom>
        FAQs
      </Typography>
      {faqData.map((faq, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};