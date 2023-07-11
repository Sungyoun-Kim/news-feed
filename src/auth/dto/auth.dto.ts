import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '- 이메일', example: 'test@email.com' })
  email: string;

  @ApiProperty({ description: '- 비밀번호', example: '1234' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: '-액세스 토큰',
    example: {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2VtYWlsIjoic3VqOTcwQG5hdmVyLmNvbSIsInN1YiI6ImI3Y2JhNzBiLTc4YmMtNDM4ZS1iMDhiLTA2NzkyODJjMTVhMCIsInJvbGUiOjIwMCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE2ODg3ODY4NjksImV4cCI6MTY5NDc4Njg2OX0.84EDA83v_I0nS48LLB1DtCx5hyEpTkv2KcIAMMF7uzI',
      expires_in: '1',
    },
  })
  refresh_token: {
    token: string;
    expires_in: string;
  };
}
export class LoginUnauthorizedDto {
  @ApiProperty({
    description: '에러 메세지',
    example: 'id or password is incorrect',
  })
  message: string;

  @ApiProperty({
    description: '에러 이름',
    example: 'Unauthorized',
  })
  error: string;

  @ApiProperty({
    description: '상태 코드',
    example: 401,
  })
  statusCode: number;
}
