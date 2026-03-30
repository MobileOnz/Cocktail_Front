import { useCallback, useEffect, useMemo, useState } from 'react';
import { clickCtaRecommendresult } from '../../analytics/eventProperty';
import { FLOW_ID } from '@env';
import { MemberRepository } from '../../model/repository/MemberRepository';
import { MemberRemoteDataSource } from '../../model/DataSource/MemberDataSource';
import { AuthRemoteDataSource } from '../../model/DataSource/AuthRemoteDataSource';
import { User } from '../../model/domain/User';

const ResultViewModel = () => {
    
    const repository = useMemo(
        () =>
            new MemberRepository(
            new MemberRemoteDataSource(),
            new AuthRemoteDataSource()
            ),
        []
    );

    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const OPTIONS = [
        ['sweet', 'sparkling', 'citrus', 'tropical', 'bitter', 'spicy', 'herbal'],
        ['meal_time', 'romantic', 'party', 'casual', 'modern', 'classic'],
        ['spring', 'summer', 'autumn', 'winter', 'all'],
        ['light', 'standard', 'special', 'strong', 'classic'],
        ['low', 'medium', 'high'],
    ];
    
    useEffect(() => {
        getMemberInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    const clickCtaRecommendResult = (id: number, name: string, answers: number[]) => {
        clickCtaRecommendresult({
            cocktailId: id,
            cocktailName: name,
            answerQ1Code: 'q1_' + OPTIONS[0][answers[0]! - 1],
            answerQ2Code: 'q2_' + OPTIONS[1][answers[1]! - 1],
            answerQ3Code: 'q3_' + OPTIONS[2][answers[2]! - 1],
            answerQ4Code: 'q4_' + OPTIONS[3][answers[3]! - 1],
            answerQ5Code: 'q5_' + OPTIONS[4][answers[4]! - 1],
            recommendFlowId: FLOW_ID,
        });
    };
    
    const getMemberInfo = useCallback(async () => {
        try {
          setLoading(true);
          const result = await repository.getMyInfo();
          setUser(result);
          console.log('내 정보 수신: ', result);
        } catch (e: any) {
          if (e.response?.status === 401) {
            setUser(null);
            return null; // 비로그인 상태
          }
          throw e;
        } finally {
          setLoading(false);
        }
      }, [repository]);

    return {
        clickCtaRecommendResult, getMemberInfo, loading, user
    };
};

export default ResultViewModel;
