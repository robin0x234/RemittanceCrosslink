import RemittanceForm from "@/components/RemittanceForm";

const SendMoney = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Send Money</h1>
      <p className="text-lg text-neutral-600 mb-8">
        Use Polkadot's interoperable blockchain network to send money across borders with lower fees and faster settlements.
      </p>
      <RemittanceForm />
    </main>
  );
};

export default SendMoney;
