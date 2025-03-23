
#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod remittance {
    #[ink(storage)]
    pub struct Remittance {
        balances: ink_storage::collections::HashMap<AccountId, Balance>,
        fees: Balance,
    }

    impl Remittance {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                balances: ink_storage::collections::HashMap::new(),
                fees: 0,
            }
        }

        #[ink(message)]
        pub fn transfer(&mut self, recipient: AccountId, amount: Balance) -> Result<(), Error> {
            let sender = self.env().caller();
            let sender_balance = self.balances.get(&sender).unwrap_or(&0);
            
            if *sender_balance < amount {
                return Err(Error::InsufficientBalance);
            }

            let fee = amount / 100; // 1% fee
            let transfer_amount = amount - fee;
            
            self.balances.insert(sender, sender_balance - amount);
            self.balances.insert(recipient, self.balances.get(&recipient).unwrap_or(&0) + transfer_amount);
            self.fees += fee;
            
            Ok(())
        }
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        InsufficientBalance,
    }
}
