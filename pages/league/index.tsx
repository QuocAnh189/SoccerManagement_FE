'use client';

import { useEffect, useState } from 'react';

//layout - interface
import { HomeLayout } from '@/components/layout';
import { ITournament, NextPageWithLayout } from '@/interfaces';

//chakra-ui
import {
  Box,
  Card,
  CardBody,
  Center,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  Input,
  Select,
  Stack,
  Text
} from '@chakra-ui/react';

//icons
import { GiTargetPrize } from 'react-icons/gi';
import { RiTeamLine } from 'react-icons/ri';
import { LuSearch } from 'react-icons/lu';

//route
import { Link } from '@chakra-ui/next-js';
//api
import { getTournamentByFormat, getTournaments } from '@/apis';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

//filter
import filter from 'lodash.filter';

//store
import { useTournamentStore } from '@/stores';
import SkeletonComponent from '@/components/common/skeleton';

interface LeagueProps {
  league: ITournament;
}
const League = (props: LeagueProps) => {
  const { league } = props;

  const setTournament = useTournamentStore(state => state.setTournament);

  return (
    <Card
      as={Link}
      textDecoration={'none'}
      maxW="sm"
      position="relative"
      paddingBottom="10px"
      _hover={{ cursor: 'pointer', textDecoration: 'none' }}
      href={`league/${league._id}/overall/${league.tags}`}
      onClick={() => setTournament(league)}
    >
      <CardBody height="100%">
        <Box position="relative" height="40%">
          <Image
            position="relative"
            src={
              league.image ||
              'https://res.cloudinary.com/dadvtny30/image/upload/v1700848793/61efb7b8b099687410e3478b317cfa51kkp0p_fijocq.png'
            }
            alt="Green double couch with wooden legs"
            borderRadius="lg"
          />
          <Box
            position="absolute"
            bottom="-25%"
            left="50%"
            transform="translateX(-50%)"
          >
            <Image
              src={
                league.logo ||
                'https://res.cloudinary.com/dadvtny30/image/upload/v1700848826/Kpe7yYs0NdySRd7jzwHaiYehQnhqz2ks26XFPwus_l3w0a4.jpg'
              }
              alt=""
              className="h-[100px] w-[100px] rounded-lg"
            />
          </Box>
        </Box>
        <Flex
          mt="14"
          height="200px"
          direction="column"
          justifyContent="space-around"
          alignItems="center"
        >
          <Heading size="md" textAlign="center">
            {league.name}
          </Heading>
          <Text textAlign="center">{league.description}</Text>
          <Box
            p="2"
            minW="100px"
            bgColor={
              (league.status === 'ACTIVE' && 'green.400') ||
              (league.status === 'FINISHED' && 'blue.400') ||
              'yellow.400'
            }
            rounded="4"
          >
            <Text textAlign="center" fontWeight="semibold" textColor="white">
              {league.status}
            </Text>
          </Box>
        </Flex>
        <Stack mt="20px" height="30%">
          <Flex justifyContent="center" alignItems="center" gap="40px">
            <Flex alignItems="center" gap="10px">
              <Icon as={RiTeamLine} color="black" />
              <Text>{league.teams.length}</Text>
            </Flex>
            <Flex alignItems="center" gap="10px">
              <Icon as={GiTargetPrize} color="black" />
              <Text>{league.prizes.length}</Text>
            </Flex>
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  );
};

export type FormatLeague = {
  formula: string;
  status: string;
  vision: string;
};

const FindLeagues: NextPageWithLayout = () => {
  const [formatLeague, setFormatLeague] = useState<FormatLeague>({
    formula: '',
    status: '',
    vision: ''
  });
  const [state, setState] = useState(false);
  const [leagues, setLeagues] = useState<ITournament[]>([]);

  const { isLoading, data: tournaments } = useQuery<ITournament[]>({
    queryKey: ['tournaments'],
    queryFn: getTournaments!,
    initialData: []
  });
  const queryClient = useQueryClient();

  const getLeagueFormat = useMutation({
    mutationFn: getTournamentByFormat,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onSettled(data) {
      setLeagues(data!);
    }
  });

  const handleChange = (name: string, value: string) => {
    setState(true);
    setFormatLeague({ ...formatLeague, [name]: value });
  };

  useEffect(() => {
    if (state) {
      getLeagueFormat.mutate({ ...formatLeague });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatLeague.formula, formatLeague.status, formatLeague.vision]);

  useEffect(() => {
    if (tournaments) {
      setLeagues(tournaments);
    }
  }, [tournaments]);

  const handleSearch = (e: React.ChangeEvent<any>) => {
    const contains = ({ name }: { name: string }, query: string) => {
      if (name.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    };

    const value = e.target.value;
    const formatQuery = value.toLowerCase();
    const filterData = filter(tournaments, category => {
      return contains(category, formatQuery);
    });
    setLeagues(filterData);
  };

  if (isLoading)
    return (
      <Box>
        <SkeletonComponent />
      </Box>
    );

  return (
    <Flex
      direction="column"
      paddingTop="150px"
      justifyContent="space-between"
      gap="50px"
      paddingLeft="30px"
      paddingRight="30px"
    >
      <Flex direction="row" justifyContent="space-between" gap="200px">
        <Flex width="20%" direction="row" alignItems="center">
          <Input
            placeholder="Search league"
            color="white"
            onChange={handleSearch}
          />
          <Center bgColor="blue.600" height="100%" px="4" rounded="6">
            <Icon as={LuSearch} color="white" />
          </Center>
        </Flex>
        <Flex direction="row" gap="20px" flexGrow="1">
          <Select
            placeholder="Format"
            background="white"
            color="black"
            defaultValue=""
            onChange={e => handleChange('formula', e.target.value)}
          >
            <option value="KNOCKOUT">Knockout</option>
            <option value="ROUND FIGHT">Round Fight</option>
            <option value="GROUP STAGE">Group Stage</option>
          </Select>
          <Select
            placeholder="Status"
            background="white"
            color="black"
            defaultValue=""
            onChange={e => handleChange('status', e.target.value)}
          >
            <option value="REGISTERING">Registering</option>
            <option value="ACTIVE">Active</option>
            <option value="FINISHED">Finished</option>
          </Select>
          <Select
            placeholder="Vision"
            background="white"
            color="black"
            defaultValue=""
            onChange={e => handleChange('vision', e.target.value)}
          >
            <option value="DOMESTIC">Domestic</option>
            <option value="INTERNATIONAL">International</option>
          </Select>
        </Flex>
      </Flex>
      <Grid
        templateColumns="repeat(4,1fr)"
        gap="5"
        justifyContent="center"
        alignItems="center"
      >
        {leagues.length !== 0 ? (
          leagues.map((league, index) => <League key={index} league={league} />)
        ) : (
          <div className=" w-screen flex justify-end">
            <SkeletonComponent />
          </div>
        )}
      </Grid>
    </Flex>
  );
};

FindLeagues.Layout = HomeLayout;

export default FindLeagues;
