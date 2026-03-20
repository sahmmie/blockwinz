import { Box, Heading, Text, VStack } from '@chakra-ui/react';

const TermsOfService = () => {
  return (
    <Box
      mx='auto'
      p={{ base: 4, md: 8 }}
      bg='#151832'
      borderRadius='8px'
      color='white'
      fontSize='md'
      boxShadow='0 4px 24px rgba(0,0,0,0.10)'>
      <Heading as='h1' size='xl' mb={6} color='#00DD25'>
        Terms of Service
      </Heading>
      <VStack align='start' gap={6}>
        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            1. Introduction
          </Heading>
          <Text>
            Welcome to Blockwinz. These Terms of Service ("Terms") govern your
            access to and use of the Blockwinz platform ("Blockwinz," "we,"
            "our," or "us"), including all features, functionalities, games,
            tokens, and associated services. By using Blockwinz, you agree to be
            bound by these Terms and our Privacy Policy.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            2. Eligibility
          </Heading>
          <Text>
            You must be at least 18 years of age or the age of legal majority in
            your jurisdiction to access or use Blockwinz. By using our services,
            you confirm that you meet this requirement and that participation in
            crypto gaming is not prohibited in your jurisdiction.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            3. Account and Wallet Responsibility
          </Heading>
          <Text>
            Blockwinz manages wallet creation and private key handling
            internally. Users are assigned a blockchain wallet address by the
            platform, but do not have access to the private keys. All
            transactions (debits and credits) are executed programmatically by
            Blockwinz on behalf of the user. By using the service, you
            acknowledge and agree that Blockwinz controls these wallets and is
            responsible for their secure handling and execution of on-chain
            actions.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            4. Fair Gameplay
          </Heading>
          <Text>
            All games on Blockwinz are built to be provably fair. Manipulation,
            use of bots, exploiting vulnerabilities, or abusing bugs is strictly
            prohibited. Any user found engaging in unfair practices may be
            banned and forfeit winnings.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            5. Use of Blockwinz Token (BWZ)
          </Heading>
          <Text>
            BWZ is the primary utility token used within the platform. It can be
            used for betting, rewards, tournament participation, and governance.
            BWZ has no guarantee of value, and users are responsible for
            understanding market risks. Blockwinz is not liable for token loss
            due to user error or market volatility.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            6. Bonuses and Promotions
          </Heading>
          <Text>
            Blockwinz may offer promotional bonuses, airdrops, or tournaments.
            These are subject to change or cancellation at any time. Abuse or
            manipulation of promotions may result in disqualification or account
            action.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            7. Prohibited Conduct
          </Heading>
          <Text>
            You agree not to: - Use the platform for illegal purposes. -
            Interfere with or disrupt platform operations. - Engage in abusive
            behavior or harassment. - Attempt to reverse engineer or copy
            platform functionality. - Upload or transmit viruses, malware, or
            harmful code.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            8. Intellectual Property
          </Heading>
          <Text>
            All content, design, logos, and games on Blockwinz are the
            intellectual property of Blockwinz and its affiliates. You may not
            copy, distribute, or reproduce any part of the platform without our
            written consent.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            9. Third-Party Services
          </Heading>
          <Text>
            Blockwinz may integrate with third-party services such as wallets,
            exchanges, or APIs. We are not responsible for the functionality or
            security of these services. Use of third-party tools is at your own
            risk.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            10. Limitation of Liability
          </Heading>
          <Text>
            Blockwinz is provided on an "as-is" and "as-available" basis. We
            disclaim all warranties, including fitness for a particular purpose.
            We shall not be liable for indirect, incidental, or consequential
            damages, including loss of tokens, data, or earnings.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            11. Termination
          </Heading>
          <Text>
            We reserve the right to suspend or terminate your access to
            Blockwinz at any time for violating these Terms or applicable laws.
            Upon termination, you may lose access to your data and balances.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            12. Governing Law
          </Heading>
          <Text>
            These Terms shall be governed by and construed in accordance with
            the laws of the Federal Republic of Nigeria. Any disputes shall be
            resolved through binding arbitration under Nigerian law.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            13. Amendments
          </Heading>
          <Text>
            We may update these Terms of Service at any time. Continued use of
            Blockwinz constitutes acceptance of the revised Terms.
          </Text>
        </Box>

        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            14. Anti-Money Laundering (AML) Compliance
          </Heading>
          <Text>
            To comply with anti-money laundering (AML) regulations and ensure a
            safe gaming environment, Blockwinz enforces a wager requirement on
            deposited funds. Users must wager at least 100% of their deposit
            amount before any withdrawal of funds is permitted. This policy
            helps prevent misuse of the platform for illicit financial
            activities and ensures that the platform is used strictly for
            gaming purposes. Blockwinz reserves the right to monitor user
            activity and take necessary actions, including freezing or
            withholding funds, in cases of suspected fraudulent or unlawful
            behavior.
          </Text>
        </Box>


        <Box>
          <Heading as='h2' size='md' mb={2} color='#00DD25'>
            15. Contact
          </Heading>
          <Text>
            For legal inquiries or support, please contact us at:
            support@blockwinz.com
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default TermsOfService;
